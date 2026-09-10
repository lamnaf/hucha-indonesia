import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStorage } from "@/infrastructure/storage/storage";
import { MediaRepository } from "@/domain/media/media.repository";
import { sniffImageType } from "@/domain/media/image-type";
import { logAudit } from "@/domain/audit/log-audit";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB pre-compression
const MAX_DIMENSION = 1920; // longest-edge resize

export interface StoredImage {
  id: number;
  filePath: string;
}

interface OptimizedImage {
  data: Buffer;
  width: number;
  height: number;
}

/** Resize + re-encode an image buffer to WebP, capturing output dimensions. */
async function optimizeImage(buffer: Buffer): Promise<OptimizedImage> {
  const result = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return {
    data: result.data,
    width: result.info.width ?? 0,
    height: result.info.height ?? 0,
  };
}

/**
 * Internal image-upload building block used directly by feature forms
 * (article cover/OG image, product images, brand/testimonial logos, site
 * assets). There is no standalone Media Library anymore — callers validate
 * their own authorization and this helper handles the rest: magic-byte type
 * sniffing (never the client MIME header), WebP optimization (max 1920px
 * edge), storage write via the configured driver, and the media row that
 * entity tables reference by FK.
 *
 * Returns the stored media reference, or an error message string.
 */
export async function storeUploadedImage(
  file: File,
  uploadedById?: number | null
): Promise<StoredImage | string> {
  if (file.size === 0) {
    return "Pilih berkas gambar terlebih dahulu";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Ukuran gambar maksimal 10 MB";
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!sniffImageType(buffer)) {
    return "Format gambar tidak didukung (JPEG, PNG, atau WebP)";
  }

  let optimized: OptimizedImage;
  try {
    optimized = await optimizeImage(buffer);
  } catch {
    return "Gagal mengoptimalkan gambar. Coba berkas lain.";
  }

  let filePath: string;
  try {
    filePath = await getStorage().put(
      optimized.data,
      `${randomUUID()}.webp`,
      "image/webp"
    );
  } catch (error) {
    console.error("[media] upload: storage write failed", error);
    return "Gagal mengunggah gambar. Periksa konfigurasi penyimpanan.";
  }

  const fileName =
    typeof file.name === "string" && file.name.trim() !== ""
      ? file.name.trim()
      : "gambar";

  try {
    const media = await new MediaRepository().create({
      fileName,
      filePath,
      mimeType: "image/webp",
      sizeBytes: optimized.data.length,
      width: optimized.width,
      height: optimized.height,
      uploadedById: uploadedById ?? null,
    });
    await logAudit({
      userId: uploadedById ?? null,
      action: "create",
      entityType: "media",
      entityId: String(media.id),
      meta: {
        fileName: media.fileName,
        filePath: media.filePath,
        width: media.width,
        height: media.height,
      },
    });
    return { id: media.id, filePath };
  } catch (error) {
    console.error("[media] upload: media record insert failed", error);
    await getStorage().delete(filePath).catch(() => {});
    return "Gagal menyimpan data gambar. Coba lagi.";
  }
}

export interface ResolvedImage {
  mediaId: number | null;
  /** Set when this resolve stored a fresh media row that the caller must
   * release (releaseUnusedMedia) if a later step of the action fails. */
  uploadedId?: number;
}

/**
 * Resolves a single-image form field pair submitted by ImageUploadField:
 * a fresh file wins (stored as a new media row), an empty kept-id hidden
 * value clears the reference, otherwise the kept id is preserved as-is.
 * Returns the resolved media id, or an error message string.
 */
export async function resolveImageInput(
  formData: FormData,
  options: { fileField: string; idField: string; userId: number }
): Promise<ResolvedImage | string> {
  const file = formData.get(options.fileField);
  if (file instanceof File && file.size > 0) {
    const stored = await storeUploadedImage(file, options.userId);
    if (typeof stored === "string") return stored;
    return { mediaId: stored.id, uploadedId: stored.id };
  }

  const raw = String(formData.get(options.idField) ?? "").trim();
  if (raw === "") return { mediaId: null };
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0
    ? { mediaId: parsed }
    : { mediaId: null };
}

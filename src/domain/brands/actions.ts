"use server";

import { revalidatePath } from "next/cache";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { MediaRepository } from "@/domain/media/media.repository";
import { resolveImageInput, type ResolvedImage } from "@/domain/media/upload-image";
import { releaseUnusedMedia, failWithCleanup } from "@/domain/media/delete-media";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { brandSchema } from "@/shared/validation/brand";
import { type AdminFormState } from "@/domain/action-state";
import {
  toBoolean,
  toNullableString,
  toOptionalNumber,
  toOptionalString,
} from "@/domain/action-utils";

/**
 * Brand admin server actions (blueprint §16 brands). All mutations require
 * `products.manage` (brands are commerce-adjacent catalog data) and write an
 * audit entry (§32).
 */

function parseBrandForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: toOptionalString(formData.get("slug")) ?? undefined,
    tagline: toNullableString(formData.get("tagline")),
    description: toNullableString(formData.get("description")),
    category: String(formData.get("category") ?? ""),
    logoMediaId: toOptionalNumber(formData.get("logoMediaId")),
    highlights: String(formData.get("highlights") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    sortOrder: Number(formData.get("sortOrder")) || 0,
    isPublished: toBoolean(formData.get("isPublished")),
  };
}

async function validateBrandReferences(input: {
  logoMediaId?: number | null;
}): Promise<string | null> {
  if (input.logoMediaId) {
    const media = await new MediaRepository().findById(input.logoMediaId);
    if (!media) {
      return "Logo media yang dipilih tidak ditemukan";
    }
    if (!media.mimeType.startsWith("image/")) {
      return "Logo harus berupa berkas gambar";
    }
  }
  return null;
}

/**
 * Resolves the brand logo from the direct-upload form fields. A newly picked
 * file is stored and wins; an empty hidden id clears the reference; otherwise
 * the kept id passes through. `uploadedId` (when set) must be released via
 * releaseUnusedMedia if a later step of the action fails. Returns an error
 * message string on failure.
 */
async function resolveBrandLogo(
  formData: FormData,
  userId: number
): Promise<ResolvedImage | string> {
  return resolveImageInput(formData, {
    fileField: "logo",
    idField: "logoMediaId",
    userId,
  });
}

function applyBrandRevalidation() {
  revalidatePath("/admin/brands");
  revalidatePath("/merek-kami");
}

export async function createBrandAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const logo = await resolveBrandLogo(formData, user.id);
  if (typeof logo === "string") return { error: logo };
  const uploadedIds = logo.uploadedId ? [logo.uploadedId] : [];

  const parsed = brandSchema.safeParse({
    ...parseBrandForm(formData),
    logoMediaId: logo.mediaId,
  });
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data merek tidak valid",
    };
  }

  const refError = await validateBrandReferences(parsed.data);
  if (refError) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: refError };
  }

  let created;
  try {
    created = await new BrandRepository().create(parsed.data);
  } catch (error) {
    return failWithCleanup(error, uploadedIds, user.id);
  }
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "brand",
    entityId: String(created.id),
    meta: { name: created.name },
  });

  applyBrandRevalidation();
  return { success: `Merek "${created.name}" berhasil dibuat` };
}

export async function updateBrandAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const logo = await resolveBrandLogo(formData, user.id);
  if (typeof logo === "string") return { error: logo };
  const uploadedIds = logo.uploadedId ? [logo.uploadedId] : [];

  const parsed = brandSchema.safeParse({
    ...parseBrandForm(formData),
    logoMediaId: logo.mediaId,
  });
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data merek tidak valid",
    };
  }

  const repository = new BrandRepository();
  const existing = await repository.findById(id);
  if (!existing) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: "Merek tidak ditemukan" };
  }

  const refError = await validateBrandReferences(parsed.data);
  if (refError) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: refError };
  }

  try {
    await repository.update(id, parsed.data);
  } catch (error) {
    return failWithCleanup(error, uploadedIds, user.id);
  }
  // Release the replaced logo; Restrict FKs keep it alive if anything else
  // (e.g. a concurrent edit) still references it.
  if (existing.logoMediaId && existing.logoMediaId !== parsed.data.logoMediaId) {
    await releaseUnusedMedia([existing.logoMediaId], user.id);
  }
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "brand",
    entityId: String(id),
    meta: { name: parsed.data.name },
  });

  applyBrandRevalidation();
  return { success: `Merek "${parsed.data.name}" berhasil diperbarui` };
}

export async function deleteBrandAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new BrandRepository().softDelete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "brand",
    entityId: String(id),
  });

  applyBrandRevalidation();
  return { success: "Merek dihapus" };
}

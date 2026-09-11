"use server";

import { revalidatePath } from "next/cache";
import { ProductRepository } from "@/domain/products/product.repository";
import { CategoryRepository } from "@/domain/products/category.repository";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { MediaRepository } from "@/domain/media/media.repository";
import { storeUploadedImage } from "@/domain/media/upload-image";
import { releaseUnusedMedia, failWithCleanup } from "@/domain/media/delete-media";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { productSchema, type ProductOutput } from "@/shared/validation/product";
import { type AdminFormState } from "@/domain/action-state";
import {
  toBoolean,
  toNullableString,
  toNumberArray,
  toOptionalNumber,
  toOptionalString,
} from "@/domain/action-utils";

/**
 * Product admin server actions (blueprint §21 / §36 products). All mutations
 * require `products.manage` and write an audit entry (§32).
 */

const MAX_PRODUCT_IMAGES = 5;

type ParsedProduct = ProductOutput;

function parseProductForm(formData: FormData): ParsedProduct {
  const categoryIdRaw = toOptionalString(formData.get("categoryId"));
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;

  const subCategoryIdRaw = toOptionalString(formData.get("subCategoryId"));
  const subCategoryId = subCategoryIdRaw ? Number(subCategoryIdRaw) : null;

  const brandIdRaw = toOptionalString(formData.get("brandId"));
  const brandId = brandIdRaw ? Number(brandIdRaw) : null;

  return {
    name: String(formData.get("name") ?? ""),
    slug: toOptionalString(formData.get("slug")) ?? undefined,
    categoryId: categoryId as number,
    subCategoryId,
    brandId,
    shortDescription: toNullableString(formData.get("shortDescription")),
    description: toNullableString(formData.get("description")),
    tokopediaUrl: toNullableString(formData.get("tokopediaUrl")),
    shopeeUrl: toNullableString(formData.get("shopeeUrl")),
    tiktokshopUrl: toNullableString(formData.get("tiktokshopUrl")),
    isFeatured: toBoolean(formData.get("isFeatured")),
    status: String(formData.get("status") ?? "draft") as
      | "draft"
      | "published",
    images: toNumberArray(formData.get("images")),
  };
}

/**
 * Resolves the product gallery from the direct-upload form fields: the kept
 * media ids (hidden csv) followed by any newly picked files, stored in that
 * order and capped at five images total — kept + new combined.
 *
 * Every upload stored during this request is tracked; if a later step fails
 * (another file failing, exceeding the cap, validation, saving), the already-
 * stored uploads are released again so no orphan media rows/files remain.
 *
 * Returns the ordered image ids plus the ids uploaded by this request (used
 * for the ownership allow-list), or an error message string.
 */
async function resolveProductImages(
  formData: FormData,
  userId: number
): Promise<{ ids: number[]; uploadedIds: number[] } | string> {
  const kept = [...new Set(toNumberArray(formData.get("images")))];
  const uploadedIds: number[] = [];

  for (const entry of formData.getAll("newImages")) {
    // Non-file / empty entries never come from our form — skip them.
    if (!(entry instanceof File) || entry.size === 0) continue;
    if (kept.length + uploadedIds.length >= MAX_PRODUCT_IMAGES) {
      await releaseUnusedMedia(uploadedIds, userId);
      return `Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk`;
    }
    const stored = await storeUploadedImage(entry, userId);
    if (typeof stored === "string") {
      await releaseUnusedMedia(uploadedIds, userId);
      return stored;
    }
    uploadedIds.push(stored.id);
  }

  return { ids: [...kept, ...uploadedIds], uploadedIds };
}

/**
 * Validates cross-entity references. Media ids are checked against an
 * explicit allow-list: freshly uploaded files plus (on update) images already
 * attached to this product. Anything else arriving through FormData is
 * tampering and rejected — an admin cannot attach another entity's media
 * (e.g. a submitted CV) by guessing its id.
 */
async function validateProductReferences(
  input: ParsedProduct,
  options: { allowedImageIds?: Set<number> } = {}
): Promise<string | null> {
  const category = await new CategoryRepository().findById(input.categoryId);
  if (!category) {
    return "Kategori yang dipilih tidak ditemukan";
  }
  if (input.subCategoryId) {
    const subCategory = await new CategoryRepository().findById(
      input.subCategoryId
    );
    if (!subCategory || subCategory.parentId !== category.id) {
      return "Sub-kategori yang dipilih tidak valid";
    }
  }
  if (input.brandId) {
    const brand = await new BrandRepository().findById(input.brandId);
    if (!brand) {
      return "Merek yang dipilih tidak ditemukan";
    }
  }
  if (input.images.length > 0) {
    const uniqueIds = [...new Set(input.images)];
    if (uniqueIds.length !== input.images.length) {
      return "Gambar produk tidak boleh duplikat";
    }
    const mediaRows = await new MediaRepository().findByIds(uniqueIds);
    if (mediaRows.length !== uniqueIds.length) {
      return "Salah satu gambar media tidak ditemukan";
    }
    for (const media of mediaRows) {
      // Only real image media may be attached — never documents or other files.
      if (!media.mimeType.startsWith("image/")) {
        return "Salah satu gambar produk tidak valid";
      }
      if (options.allowedImageIds && !options.allowedImageIds.has(media.id)) {
        return "Salah satu gambar produk tidak valid";
      }
    }
  }
  return null;
}

function applyProductRevalidation() {
  revalidatePath("/admin/products");
  revalidatePath("/produk");
  revalidatePath("/produk/[slug]");
}

export async function createProductAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const resolved = await resolveProductImages(formData, user.id);
  if (typeof resolved === "string") return { error: resolved };
  const { ids: images, uploadedIds } = resolved;

  const parsed = productSchema.safeParse({
    ...parseProductForm(formData),
    images,
  });
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data produk tidak valid",
    };
  }

  // On create nothing pre-exists, so only this request's uploads may be used.
  const refError = await validateProductReferences(parsed.data, {
    allowedImageIds: new Set(uploadedIds),
  });
  if (refError) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: refError };
  }

  let created;
  try {
    created = await new ProductRepository().create(parsed.data);
  } catch (error) {
    return failWithCleanup(error, uploadedIds, user.id);
  }

  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "product",
    entityId: String(created.id),
    meta: { name: parsed.data.name },
  });

  applyProductRevalidation();
  return { success: `Produk "${parsed.data.name}" berhasil dibuat` };
}

export async function updateProductAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const existing = await new ProductRepository().findById(id);
  if (!existing) {
    return { error: `Produk #${id} tidak ditemukan` };
  }

  const resolved = await resolveProductImages(formData, user.id);
  if (typeof resolved === "string") return { error: resolved };
  const { ids: images, uploadedIds } = resolved;

  const parsed = productSchema.safeParse({
    ...parseProductForm(formData),
    images,
  });
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data produk tidak valid",
    };
  }

  // Kept ids must already belong to THIS product; new ids must be uploads
  // from this very request. Foreign media ids are rejected.
  const refError = await validateProductReferences(parsed.data, {
    allowedImageIds: new Set([
      ...existing.images.map((image) => image.mediaId),
      ...uploadedIds,
    ]),
  });
  if (refError) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: refError };
  }

  let updated;
  try {
    updated = await new ProductRepository().update(id, parsed.data);
  } catch (error) {
    return failWithCleanup(error, uploadedIds, user.id);
  }

  // Gallery rows were rewritten inside the update transaction. Media that was
  // attached before but is gone now gets released — unless another entity
  // still references it (`releaseUnusedMedia` relies on the Restrict FKs).
  const finalIds = new Set(parsed.data.images);
  const removedMediaIds = existing.images
    .map((image) => image.mediaId)
    .filter((mediaId) => !finalIds.has(mediaId));
  if (removedMediaIds.length > 0) {
    await releaseUnusedMedia(removedMediaIds, user.id);
  }

  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "product",
    entityId: String(updated.id),
    meta: { name: parsed.data.name },
  });

  applyProductRevalidation();
  return { success: `Produk "${parsed.data.name}" berhasil diperbarui` };
}

export async function deleteProductAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new ProductRepository().softDelete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "product",
    entityId: String(id),
  });

  applyProductRevalidation();
  return { success: "Produk dihapus" };
}

export async function toggleProductFeaturedAction(
  id: number,
  isFeatured: boolean
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new ProductRepository().setFeatured(id, isFeatured);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "product",
    entityId: String(id),
    meta: { isFeatured },
  });

  applyProductRevalidation();
  return {
    success: isFeatured ? "Produk ditandai unggulan" : "Penanda unggulan dihapus",
  };
}

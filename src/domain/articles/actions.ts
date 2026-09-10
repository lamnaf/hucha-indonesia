"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { ArticleRepository } from "@/domain/articles/article.repository";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import { TagRepository } from "@/domain/articles/tag.repository";
import { MediaRepository } from "@/domain/media/media.repository";
import { resolveImageInput } from "@/domain/media/upload-image";
import { releaseUnusedMedia, failWithCleanup } from "@/domain/media/delete-media";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { articleSchema } from "@/shared/validation/article";
import { type AdminFormState } from "@/domain/action-state";
import { toNullableString, toOptionalNumber, toOptionalString } from "@/domain/action-utils";

/**
 * Blog article admin server actions (blueprint §25 / §36 articles).
 * All mutations require `articles.manage` and write an audit entry (§32).
 */

type ArticleSeo = NonNullable<z.output<typeof articleSchema>["seo"]>;

function parseArticleForm(formData: FormData) {
  const publishedAt = String(formData.get("publishedAt") ?? "");
  const seo: Record<string, string | number | null> = {};
  const seoStringFields = [
    "metaTitle",
    "metaDescription",
    "slugOverride",
    "ogTitle",
    "ogDescription",
    "twitterCard",
    "robots",
    "keywords",
    "canonicalUrl",
  ] as const;
  for (const field of seoStringFields) {
    const value = formData.get(field);
    if (value !== null && typeof value === "string" && value.trim() !== "") {
      seo[field] = value.trim();
    }
  }
  const ogImage = formData.get("ogImageMediaId");
  if (ogImage !== null && typeof ogImage === "string" && ogImage !== "") {
    seo.ogImageMediaId = Number(ogImage);
  }

  return {
    title: String(formData.get("title") ?? ""),
    slug: toOptionalString(formData.get("slug")) ?? undefined,
    blogCategoryId: Number(formData.get("blogCategoryId")),
    featuredMediaId: toOptionalNumber(formData.get("featuredMediaId")),
    excerpt: toNullableString(formData.get("excerpt")),
    body: toNullableString(formData.get("body")),
    status: String(formData.get("status") ?? "draft"),
    isFeatured: formData.get("isFeatured") === "on",
    publishedAt:
      publishedAt === "" ? null : new Date(publishedAt).toISOString(),
    tagIds: formData
      .getAll("tagIds")
      .map((value) => Number(value))
      .filter((n) => Number.isInteger(n) && n > 0),
    seo: Object.keys(seo).length > 0 ? seo : undefined,
  };
}

async function validateArticleReferences(input: {
  blogCategoryId: number;
  featuredMediaId?: number | null;
  ogImageMediaId?: number | null;
  tagIds: number[];
  status: string;
  publishedAt?: string | null;
}): Promise<string | null> {
  const category = await new BlogCategoryRepository().findById(
    input.blogCategoryId
  );
  if (!category) {
    return "Kategori blog yang dipilih tidak ditemukan";
  }
  const invalidImage = async (
    mediaId: number | null | undefined,
    label: string
  ) => {
    if (!mediaId) return null;
    const media = await new MediaRepository().findById(mediaId);
    if (!media) return `${label} yang dipilih tidak ditemukan`;
    if (!media.mimeType.startsWith("image/")) {
      return `${label} harus berupa berkas gambar`;
    }
    return null;
  };
  const featuredError = await invalidImage(
    input.featuredMediaId,
    "Gambar sampul"
  );
  if (featuredError) return featuredError;
  const ogError = await invalidImage(input.ogImageMediaId, "Gambar OG");
  if (ogError) return ogError;
  if (input.tagIds.length > 0) {
    const tags = await new TagRepository().findByIds(input.tagIds);
    if (tags.length !== input.tagIds.length) {
      return "Salah satu tag yang dipilih tidak ditemukan";
    }
  }
  if (input.status === "scheduled" && !input.publishedAt) {
    return "Artikel terjadwal wajib memiliki tanggal tayang";
  }
  return null;
}

/**
 * Resolves the direct-upload image fields (cover + SEO OG image). A newly
 * picked file is stored and wins; an empty hidden id clears the reference;
 * otherwise the kept id passes through. `setOgKey` tells the caller whether
 * the resolved OG id must be written into the seo payload: always on update
 * (so clearing persists as an explicit null instead of "leave unchanged"),
 * and on create only when a file was actually uploaded — so no empty SeoMeta
 * row is created for articles without any SEO data.
 *
 * `uploadedIds` tracks media rows created by this request so callers can roll
 * them back (releaseUnusedMedia) when a later step fails; if the second
 * resolve fails, the first upload is released here. Returns an error message
 * string on failure.
 */
async function resolveArticleImages(
  formData: FormData,
  userId: number,
  isUpdate: boolean
): Promise<
  | {
      featuredMediaId: number | null;
      ogImageMediaId: number | null;
      setOgKey: boolean;
      uploadedIds: number[];
    }
  | string
> {
  const uploadedIds: number[] = [];
  const featured = await resolveImageInput(formData, {
    fileField: "thumbnail",
    idField: "featuredMediaId",
    userId,
  });
  if (typeof featured === "string") return featured;
  if (featured.uploadedId) uploadedIds.push(featured.uploadedId);

  const ogFile = formData.get("ogImage");
  const ogUploaded = ogFile instanceof File && ogFile.size > 0;
  const ogImage = await resolveImageInput(formData, {
    fileField: "ogImage",
    idField: "ogImageMediaId",
    userId,
  });
  if (typeof ogImage === "string") {
    await releaseUnusedMedia(uploadedIds, userId);
    return ogImage;
  }
  if (ogImage.uploadedId) uploadedIds.push(ogImage.uploadedId);

  return {
    featuredMediaId: featured.mediaId,
    ogImageMediaId: ogImage.mediaId,
    setOgKey: ogUploaded || isUpdate,
    uploadedIds,
  };
}

/** Merges the resolved OG image id into the parsed SEO payload. */
function applyArticleSeoImages(
  parsedSeo: ArticleSeo | undefined,
  images: { ogImageMediaId: number | null; setOgKey: boolean }
): ArticleSeo | undefined {
  if (!images.setOgKey) return parsedSeo;
  const seo: ArticleSeo = { ...(parsedSeo ?? {}) };
  seo.ogImageMediaId = images.ogImageMediaId;
  return seo;
}

function applyArticleRevalidation() {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]");
}

export async function createArticleAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = articleSchema.safeParse(parseArticleForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data artikel tidak valid",
    };
  }

  const images = await resolveArticleImages(formData, user.id, false);
  if (typeof images === "string") return { error: images };

  const refError = await validateArticleReferences({
    blogCategoryId: parsed.data.blogCategoryId,
    featuredMediaId: images.featuredMediaId,
    ogImageMediaId: images.ogImageMediaId,
    tagIds: parsed.data.tagIds,
    status: parsed.data.status,
    publishedAt: parsed.data.publishedAt,
  });
  if (refError) {
    await releaseUnusedMedia(images.uploadedIds, user.id);
    return { error: refError };
  }

  let created;
  try {
    created = await new ArticleRepository().create({
      ...parsed.data,
      featuredMediaId: images.featuredMediaId,
      seo: applyArticleSeoImages(parsed.data.seo, images),
      authorId: user.id,
    });
  } catch (error) {
    return failWithCleanup(error, images.uploadedIds, user.id);
  }
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "article",
    entityId: String(created.id),
    meta: { title: created.title },
  });

  applyArticleRevalidation();
  return { success: `Artikel "${created.title}" berhasil dibuat` };
}

export async function updateArticleAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = articleSchema.safeParse(parseArticleForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data artikel tidak valid",
    };
  }

  const images = await resolveArticleImages(formData, user.id, true);
  if (typeof images === "string") return { error: images };

  const repository = new ArticleRepository();
  const existing = await repository.findById(id);
  if (!existing) {
    await releaseUnusedMedia(images.uploadedIds, user.id);
    return { error: "Artikel tidak ditemukan" };
  }

  const refError = await validateArticleReferences({
    blogCategoryId: parsed.data.blogCategoryId,
    featuredMediaId: images.featuredMediaId,
    ogImageMediaId: images.ogImageMediaId,
    tagIds: parsed.data.tagIds,
    status: parsed.data.status,
    publishedAt: parsed.data.publishedAt,
  });
  if (refError) {
    await releaseUnusedMedia(images.uploadedIds, user.id);
    return { error: refError };
  }

  // Media replaced by this update (old cover / old OG image). releaseUnusedMedia
  // relies on the Restrict FKs, so a media re-attached concurrently is kept.
  const removedMediaIds = [
    ...new Set(
      [
        existing.featuredMediaId !== images.featuredMediaId
          ? existing.featuredMediaId
          : null,
        (existing.seoMeta?.ogImageMediaId ?? null) !== images.ogImageMediaId
          ? existing.seoMeta?.ogImageMediaId ?? null
          : null,
      ].filter((mediaId): mediaId is number => mediaId !== null)
    ),
  ];

  try {
    await repository.update(id, {
      ...parsed.data,
      featuredMediaId: images.featuredMediaId,
      seo: applyArticleSeoImages(parsed.data.seo, images),
    });
  } catch (error) {
    return failWithCleanup(error, images.uploadedIds, user.id);
  }
  await releaseUnusedMedia(removedMediaIds, user.id);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "article",
    entityId: String(id),
    meta: { title: parsed.data.title },
  });

  applyArticleRevalidation();
  return { success: `Artikel "${parsed.data.title}" berhasil diperbarui` };
}

export async function deleteArticleAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new ArticleRepository().softDelete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "article",
    entityId: String(id),
  });

  applyArticleRevalidation();
  return { success: "Artikel dihapus" };
}

export async function publishArticleAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new ArticleRepository().publish(id);
  await logAudit({
    userId: user.id,
    action: "publish",
    entityType: "article",
    entityId: String(id),
  });

  applyArticleRevalidation();
  return { success: "Artikel diterbitkan" };
}

export async function setArticleFeaturedAction(
  id: number,
  isFeatured: boolean
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new ArticleRepository().setFeatured(id, isFeatured);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "article",
    entityId: String(id),
    meta: { isFeatured },
  });

  applyArticleRevalidation();
  return {
    success: isFeatured ? "Artikel ditandai unggulan" : "Artikel tidak lagi unggulan",
  };
}

export async function duplicateArticleAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  const copy = await new ArticleRepository().duplicate(id);
  if (!copy) {
    return { error: "Artikel asal tidak ditemukan" };
  }
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "article",
    entityId: String(copy.id),
    meta: { duplicateOf: id, title: copy.title },
  });

  applyArticleRevalidation();
  return { success: `Artikel disalin sebagai "${copy.title}"` };
}

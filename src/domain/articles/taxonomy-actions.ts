"use server";

import { revalidatePath } from "next/cache";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import { TagRepository } from "@/domain/articles/tag.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { taxonomySchema } from "@/shared/validation/common";
import { type AdminFormState } from "@/domain/action-state";
import { ConflictError } from "@/domain/errors";
import { toOptionalString } from "@/domain/action-utils";

/**
 * Blog taxonomy admin server actions (blueprint §25): blog categories and
 * tags. Both are simple name+slug records. All mutations require
 * `articles.manage` and write an audit entry (§32).
 */

function parseTaxonomyForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: toOptionalString(formData.get("slug")) ?? undefined,
  };
}

export async function createBlogCategoryAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = taxonomySchema.safeParse(parseTaxonomyForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  const created = await new BlogCategoryRepository().create(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "blog_category",
    entityId: String(created.id),
    meta: { name: created.name },
  });

  revalidatePath("/admin/blog/categories");
  return { success: `Kategori blog "${created.name}" berhasil dibuat` };
}

export async function updateBlogCategoryAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = taxonomySchema.safeParse(parseTaxonomyForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  await new BlogCategoryRepository().update(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "blog_category",
    entityId: String(id),
    meta: { name: parsed.data.name },
  });

  revalidatePath("/admin/blog/categories");
  return { success: "Kategori blog diperbarui" };
}

export async function deleteBlogCategoryAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  try {
    await new BlogCategoryRepository().delete(id);
  } catch (error) {
    if (error instanceof ConflictError) {
      return { error: error.message };
    }
    throw error;
  }

  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "blog_category",
    entityId: String(id),
  });

  revalidatePath("/admin/blog/categories");
  return { success: "Kategori blog dihapus" };
}

export async function createTagAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = taxonomySchema.safeParse(parseTaxonomyForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tag tidak valid",
    };
  }

  const created = await new TagRepository().create(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "tag",
    entityId: String(created.id),
    meta: { name: created.name },
  });

  revalidatePath("/admin/blog/tags");
  return { success: `Tag "${created.name}" berhasil dibuat` };
}

export async function updateTagAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = taxonomySchema.safeParse(parseTaxonomyForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tag tidak valid",
    };
  }

  await new TagRepository().update(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "tag",
    entityId: String(id),
    meta: { name: parsed.data.name },
  });

  revalidatePath("/admin/blog/tags");
  return { success: "Tag diperbarui" };
}

export async function deleteTagAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  try {
    await new TagRepository().delete(id);
  } catch (error) {
    if (error instanceof ConflictError) {
      return { error: error.message };
    }
    throw error;
  }

  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "tag",
    entityId: String(id),
  });

  revalidatePath("/admin/blog/tags");
  return { success: "Tag dihapus" };
}

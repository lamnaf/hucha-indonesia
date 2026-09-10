"use server";

import { revalidatePath } from "next/cache";
import { CategoryRepository } from "@/domain/products/category.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { categorySchema } from "@/shared/validation/category";
import { type AdminFormState } from "@/domain/action-state";
import { ConflictError } from "@/domain/errors";
import { toOptionalNumber, toOptionalString } from "@/domain/action-utils";

/**
 * Product category admin server actions (blueprint §21 / §36 categories).
 * Categories form a 2-level tree: top-level (type) and sub-categories.
 */

function parseCategoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: toOptionalString(formData.get("slug")) ?? undefined,
    type: String(formData.get("type") ?? ""),
    parentId: toOptionalNumber(formData.get("parentId")),
  };
}

async function validateParent(
  type: string,
  parentId: number | null
): Promise<string | null> {
  if (parentId === null) return null;
  const parent = await new CategoryRepository().findById(parentId);
  if (!parent) {
    return "Kategori induk tidak ditemukan";
  }
  if (parent.parentId !== null) {
    return "Sub-kategori tidak dapat menjadi induk (maksimal 2 tingkat)";
  }
  if (parent.type !== type) {
    return "Sub-kategori harus bertipe sama dengan kategori induk";
  }
  return null;
}

export async function createCategoryAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = categorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  const parentError = await validateParent(
    parsed.data.type,
    parsed.data.parentId ?? null
  );
  if (parentError) {
    return { error: parentError };
  }

  const created = await new CategoryRepository().create(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "category",
    entityId: String(created.id),
    meta: { name: created.name, type: created.type },
  });

  revalidatePath("/admin/categories");
  return { success: `Kategori "${created.name}" berhasil dibuat` };
}

export async function updateCategoryAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = categorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  const parentError = await validateParent(
    parsed.data.type,
    parsed.data.parentId ?? null
  );
  if (parentError) {
    return { error: parentError };
  }

  const updated = await new CategoryRepository().update(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "category",
    entityId: String(id),
    meta: { name: updated.name, type: updated.type },
  });

  revalidatePath("/admin/categories");
  return { success: `Kategori "${updated.name}" berhasil diperbarui` };
}

export async function deleteCategoryAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  try {
    await new CategoryRepository().delete(id);
  } catch (error) {
    if (error instanceof ConflictError) {
      return { error: error.message };
    }
    throw error;
  }

  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "category",
    entityId: String(id),
  });

  revalidatePath("/admin/categories");
  return { success: "Kategori dihapus" };
}

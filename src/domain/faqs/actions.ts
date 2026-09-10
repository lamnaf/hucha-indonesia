"use server";

import { revalidatePath } from "next/cache";
import { FaqRepository } from "@/domain/faqs/faq.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { faqCategorySchema, faqSchema } from "@/shared/validation/faq";
import { toOptionalNumber } from "@/domain/action-utils";
import { type AdminFormState } from "@/domain/action-state";
import { ConflictError } from "@/domain/errors";

/**
 * FAQ admin server actions (blueprint §30 FAQ).
 * All mutations require `faq.manage` and write an audit entry (§32).
 */

function parseFaqForm(formData: FormData) {
  return {
    faqCategoryId: toOptionalNumber(formData.get("faqCategoryId")),
    question: formData.get("question"),
    answer: formData.get("answer"),
    sortOrder: toOptionalNumber(formData.get("sortOrder")) ?? 0,
    isPublished: formData.get("isPublished") === "on",
  };
}

function parseFaqCategoryForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") ? String(formData.get("slug")) : undefined,
  };
}

async function validateFaqCategoryReference(
  faqCategoryId: number
): Promise<string | null> {
  const category = await new FaqRepository().findCategoryById(faqCategoryId);
  if (!category) {
    return "Kategori FAQ yang dipilih tidak ditemukan";
  }
  return null;
}

function applyFaqRevalidation() {
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function createFaqAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = faqSchema.safeParse(parseFaqForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data FAQ tidak valid",
    };
  }

  const categoryError = await validateFaqCategoryReference(
    parsed.data.faqCategoryId
  );
  if (categoryError) {
    return { error: categoryError };
  }

  const faq = await new FaqRepository().createFaq(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "faq",
    entityId: String(faq.id),
    meta: { question: parsed.data.question },
  });

  applyFaqRevalidation();
  return { success: "FAQ berhasil dibuat" };
}

export async function updateFaqAction(
  id: number,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = faqSchema.safeParse(parseFaqForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data FAQ tidak valid",
    };
  }

  const categoryError = await validateFaqCategoryReference(
    parsed.data.faqCategoryId
  );
  if (categoryError) {
    return { error: categoryError };
  }

  await new FaqRepository().updateFaq(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "faq",
    entityId: String(id),
  });

  applyFaqRevalidation();
  return { success: "FAQ berhasil diperbarui" };
}

export async function deleteFaqAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new FaqRepository().deleteFaq(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "faq",
    entityId: String(id),
  });

  applyFaqRevalidation();
  return { success: "FAQ dihapus" };
}

export async function createFaqCategoryAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = faqCategorySchema.safeParse(parseFaqCategoryForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kategori FAQ tidak valid",
    };
  }

  const created = await new FaqRepository().createCategory(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "faq_category",
    entityId: String(created.id),
    meta: { name: parsed.data.name },
  });

  applyFaqRevalidation();
  return { success: "Kategori FAQ berhasil dibuat" };
}

export async function updateFaqCategoryAction(
  id: number,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = faqCategorySchema.safeParse(parseFaqCategoryForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data kategori FAQ tidak valid",
    };
  }

  await new FaqRepository().updateCategory(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "faq_category",
    entityId: String(id),
    meta: { name: parsed.data.name },
  });

  applyFaqRevalidation();
  return { success: "Kategori FAQ berhasil diperbarui" };
}

export async function deleteFaqCategoryAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  try {
    await new FaqRepository().deleteCategory(id);
  } catch (error) {
    if (error instanceof ConflictError) {
      return { error: error.message };
    }
    throw error;
  }
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "faq_category",
    entityId: String(id),
  });

  applyFaqRevalidation();
  return { success: "Kategori FAQ dihapus" };
}

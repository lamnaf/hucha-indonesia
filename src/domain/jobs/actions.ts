"use server";

import { revalidatePath } from "next/cache";
import { JobRepository } from "@/domain/jobs/job.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { jobSchema, jobStatusUpdateSchema } from "@/shared/validation/job";
import { type AdminFormState } from "@/domain/action-state";
import { toNullableString, toOptionalString } from "@/domain/action-utils";
import type { JobStatus } from "@/infrastructure/database/generated/client";

/**
 * Career/job admin server actions (blueprint §24 / §36 career). All
 * mutations require `career.manage` and write an audit entry (§32).
 */

function parseJobForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: toOptionalString(formData.get("slug")) ?? undefined,
    department: toNullableString(formData.get("department")),
    location: toNullableString(formData.get("location")),
    employmentType: String(formData.get("employmentType") ?? "full_time"),
    description: toNullableString(formData.get("description")),
    requirements: toNullableString(formData.get("requirements")),
    status: String(formData.get("status") ?? "open"),
  };
}

function applyJobRevalidation() {
  revalidatePath("/admin/career");
  revalidatePath("/karir");
  revalidatePath("/karir/[slug]");
}

export async function createJobAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = jobSchema.safeParse(parseJobForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data lowongan tidak valid",
    };
  }

  const created = await new JobRepository().create(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "job",
    entityId: String(created.id),
    meta: { title: created.title },
  });

  applyJobRevalidation();
  return { success: `Lowongan "${created.title}" berhasil dibuat` };
}

export async function updateJobAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = jobSchema.safeParse(parseJobForm(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data lowongan tidak valid",
    };
  }

  await new JobRepository().update(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "job",
    entityId: String(id),
    meta: { title: parsed.data.title },
  });

  applyJobRevalidation();
  return { success: `Lowongan "${parsed.data.title}" berhasil diperbarui` };
}

export async function deleteJobAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new JobRepository().softDelete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "job",
    entityId: String(id),
  });

  applyJobRevalidation();
  return { success: "Lowongan dihapus" };
}

export async function setJobStatusAction(
  id: number,
  status: JobStatus
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = jobStatusUpdateSchema.safeParse({ status });
  if (!parsed.success) {
    return { error: "Status lowongan tidak valid" };
  }

  await new JobRepository().setStatus(id, parsed.data.status);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "job",
    entityId: String(id),
    meta: { status: parsed.data.status },
  });

  applyJobRevalidation();
  return {
    success:
      parsed.data.status === "open" ? "Lowongan dibuka" : "Lowongan ditutup",
  };
}

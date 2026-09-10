"use server";

import { revalidatePath } from "next/cache";
import { ApplicationRepository } from "@/domain/jobs/application.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { applicationStatusUpdateSchema } from "@/shared/validation/job";
import { type AdminFormState } from "@/domain/action-state";
import type { ApplicationStatus } from "@/infrastructure/database/generated/client";

function applyApplicationRevalidation() {
  revalidatePath("/admin/applications");
  revalidatePath("/admin/applications/[id]");
}

/**
 * Job application admin server actions (blueprint §24 / §36 applications).
 * All mutations require `applications.manage` and write an audit entry (§32).
 */

export async function setApplicationStatusAction(
  id: number,
  status: ApplicationStatus
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const parsed = applicationStatusUpdateSchema.safeParse({ status });
  if (!parsed.success) {
    return { error: "Status lamaran tidak valid" };
  }

  await new ApplicationRepository().updateStatus(id, parsed.data.status);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "application",
    entityId: String(id),
    meta: { status: parsed.data.status },
  });

  applyApplicationRevalidation();
  return { success: "Status lamaran diperbarui" };
}

export async function deleteApplicationAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new ApplicationRepository().delete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "application",
    entityId: String(id),
  });

  applyApplicationRevalidation();
  return { success: "Lamaran dihapus" };
}

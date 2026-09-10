"use server";

import { revalidatePath } from "next/cache";
import { LeadRepository } from "@/domain/leads/lead.repository";
import { UserRepository } from "@/domain/users/user.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { leadUpdateSchema, leadNoteSchema } from "@/shared/validation/lead";
import { type AdminFormState } from "@/domain/action-state";

/**
 * Lead admin server actions (blueprint §22 / §23 / §36 leads).
 * All mutations require `leads.manage` and write an audit entry (§32).
 */

export async function updateLeadAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const rawStatus = formData.get("status");
  const rawAssignee = formData.get("assignedToId");

  const parsed = leadUpdateSchema.safeParse({
    status: rawStatus,
    assignedToId:
      rawAssignee && String(rawAssignee) !== "" ? Number(rawAssignee) : null,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data lead tidak valid",
    };
  }

  const { assignedToId } = parsed.data;
  if (assignedToId !== undefined && assignedToId !== null) {
    const assignee = await new UserRepository().findById(assignedToId);
    if (!assignee) {
      return { error: "Staf yang dituju tidak ditemukan" };
    }
  }

  await new LeadRepository().updateStatus(id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "lead",
    entityId: String(id),
    meta: {
      status: parsed.data.status,
      assignedToId: parsed.data.assignedToId ?? null,
    },
  });

  revalidatePath("/admin/leads");
  return { success: "Lead diperbarui" };
}

export async function deleteLeadAction(id: number): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new LeadRepository().delete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "lead",
    entityId: String(id),
  });

  revalidatePath("/admin/leads");
  return { success: "Lead dihapus" };
}

export async function archiveLeadAction(
  id: number,
  archived: boolean
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new LeadRepository().archive(id, archived);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "lead",
    entityId: String(id),
    meta: { archived },
  });

  revalidatePath("/admin/leads");
  return { success: archived ? "Lead diarsipkan" : "Lead dipulihkan" };
}

export async function markLeadReadAction(
  id: number,
  isRead: boolean
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new LeadRepository().markRead(id, isRead);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "lead",
    entityId: String(id),
    meta: { isRead },
  });

  revalidatePath("/admin/leads");
  return { success: isRead ? "Lead ditandai sudah dibaca" : "Lead ditandai belum dibaca" };
}

export async function addLeadNoteAction(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const rawNote = formData.get("note");
  const parsed = leadNoteSchema.safeParse(
    typeof rawNote === "string" ? rawNote : ""
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Catatan tidak valid" };
  }

  await new LeadRepository().addNote(id, user.id, parsed.data);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "lead",
    entityId: String(id),
    meta: { addedNote: true },
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return { success: "Catatan ditambahkan" };
}

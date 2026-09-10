"use server";

import { revalidatePath } from "next/cache";
import { NewsletterSubscriberRepository } from "@/domain/newsletter/newsletter.repository";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { type AdminFormState } from "@/domain/action-state";

/**
 * Newsletter admin server actions (blueprint §34 / §36 newsletter).
 * All mutations require `newsletter.manage` and write an audit entry (§32).
 */

export async function setSubscriberOptOutAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new NewsletterSubscriberRepository().optOut(id);
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "newsletter",
    entityId: String(id),
    meta: { action: "opt-out" },
  });

  revalidatePath("/admin/newsletter");
  return { success: "Pelanggan dihentikan dari langganan" };
}

export async function deleteSubscriberAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new NewsletterSubscriberRepository().delete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "newsletter",
    entityId: String(id),
  });

  revalidatePath("/admin/newsletter");
  return { success: "Pelanggan dihapus" };
}

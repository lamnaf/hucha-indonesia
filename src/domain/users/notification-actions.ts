"use server";

import { revalidatePath } from "next/cache";
import { NotificationRepository } from "@/domain/users/notification.repository";
import { requireAuth } from "@/domain/auth/guards";
import { idSchema } from "@/shared/validation/common";

/**
 * In-app notification actions (blueprint §29 — unread-count badge + read
 * marking). Notifications are scoped to their owner; reads never touch
 * another user's rows.
 */

export async function markNotificationReadAction(
  notificationId: number
): Promise<void> {
  const user = await requireAuth();
  const parsedId = idSchema.safeParse(notificationId);
  if (!parsedId.success) {
    return;
  }
  await new NotificationRepository().markRead(parsedId.data, user.id);
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireAuth();
  await new NotificationRepository().markAllRead(user.id);
  revalidatePath("/admin/notifications");
}

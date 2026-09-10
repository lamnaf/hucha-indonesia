import {
  PrismaClient,
  Prisma,
  NotificationType,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export interface NotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  body?: string | null;
}

export interface NotificationListOptions {
  page?: number;
  pageSize?: number;
}

/**
 * In-app notifications for admin users (blueprint §29: unread-count badge
 * in the admin chrome). Notification sending is best-effort — a delivery
 * failure must never block the underlying lead/application write (§29 edge
 * cases), so this repository only records rows.
 */
export class NotificationRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async create(input: NotificationInput) {
    return this.client.notification.create({
      data: {
        ...input,
        body: input.body ?? null,
      },
    });
  }

  async listForUser(userId: number, options: NotificationListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.NotificationWhereInput = { userId };

    const [items, total, unread] = await Promise.all([
      this.client.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.client.notification.count({ where }),
      this.client.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { items, total, unread, page, pageSize };
  }

  unreadCount(userId: number) {
    return this.client.notification.count({
      where: { userId, isRead: false },
    });
  }

  /** Marks a single notification read — scoped to its owner. */
  async markRead(id: number, userId: number) {
    return this.client.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: number) {
    return this.client.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

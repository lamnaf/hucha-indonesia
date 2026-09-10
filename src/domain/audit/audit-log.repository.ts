import {
  PrismaClient,
  Prisma,
  AuditAction,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export interface AuditLogInput {
  userId?: number | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  meta?: unknown;
}

export interface AuditLogListOptions {
  userId?: number;
  action?: AuditAction;
  entityType?: string;
  page?: number;
  pageSize?: number;
}

export class AuditLogRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  /**
   * Append-only by convention (blueprint §32): no update/delete methods.
   */
  async create(input: AuditLogInput) {
    return this.client.auditLog.create({
      data: {
        ...input,
        meta: input.meta as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async list(options: AuditLogListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.AuditLogWhereInput = {};
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;
    if (options.entityType) where.entityType = options.entityType;

    const [items, total] = await Promise.all([
      this.client.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.client.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}

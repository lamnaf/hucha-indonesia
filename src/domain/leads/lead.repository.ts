import {
  PrismaClient,
  Prisma,
  LeadType,
  LeadStatus,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { NotFoundError, runMapped } from "@/domain/errors";

export interface LeadListOptions {
  type?: LeadType;
  status?: LeadStatus;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  archived?: boolean;
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface LeadInput {
  fullName: string;
  companyName?: string | null;
  region?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  message?: string | null;
  categoryOfInterest?: string | null;
  businessType?: string | null;
  sourcePage?: string | null;
}

export interface LeadStatusUpdate {
  status: LeadStatus;
  assignedToId?: number | null;
}

export class LeadRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  private buildWhere(options: LeadListOptions): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};
    if (options.archived !== undefined) where.archived = options.archived;
    if (options.unreadOnly) where.isRead = false;
    if (options.type) where.type = options.type;
    if (options.status) where.status = options.status;
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {
        ...(options.dateFrom ? { gte: options.dateFrom } : {}),
        ...(options.dateTo ? { lte: options.dateTo } : {}),
      };
    }
    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: "insensitive" } },
        { companyName: { contains: options.search, mode: "insensitive" } },
        { email: { contains: options.search, mode: "insensitive" } },
        { whatsapp: { contains: options.search, mode: "insensitive" } },
        { region: { contains: options.search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  async create(type: LeadType, input: LeadInput) {
    return this.client.lead.create({ data: { type, ...input } });
  }

  async list(options: LeadListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where = this.buildWhere(options);

    const [items, total] = await Promise.all([
      this.client.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { assignedToUser: { select: { id: true, name: true } } },
      }),
      this.client.lead.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findById(id: number) {
    return this.client.lead.findUnique({
      where: { id },
      include: { assignedToUser: { select: { id: true, name: true } } },
    });
  }

  async updateStatus(id: number, input: LeadStatusUpdate) {
    return runMapped(
      () =>
        this.client.lead.update({
          where: { id },
          data: {
            status: input.status,
            ...(input.assignedToId !== undefined
              ? { assignedToId: input.assignedToId }
              : {}),
          },
        }),
      { notFound: `Lead #${id} tidak ditemukan` }
    );
  }

  async markRead(id: number, isRead: boolean) {
    return runMapped(
      () => this.client.lead.update({ where: { id }, data: { isRead } }),
      { notFound: `Lead #${id} tidak ditemukan` }
    );
  }

  async archive(id: number, archived: boolean) {
    return runMapped(
      () => this.client.lead.update({ where: { id }, data: { archived } }),
      { notFound: `Lead #${id} tidak ditemukan` }
    );
  }

  async addNote(id: number, userId: number, note: string) {
    const lead = await this.client.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundError(`Lead #${id} tidak ditemukan`);
    }
    const user = await this.client.user.findUnique({ where: { id: userId } });
    const prefix = `[${new Date().toISOString()}] ${user?.name ?? `User #${userId}`}: `;
    const combined = [lead.notes, prefix + note].filter(Boolean).join("\n");
    return runMapped(
      () =>
        this.client.lead.update({
          where: { id },
          data: { notes: combined, isRead: true },
        }),
      { notFound: `Lead #${id} tidak ditemukan` }
    );
  }

  async updateNotes(id: number, notes: string) {
    return runMapped(
      () => this.client.lead.update({ where: { id }, data: { notes } }),
      { notFound: `Lead #${id} tidak ditemukan` }
    );
  }

  async exportAll(options: LeadListOptions = {}) {
    const where = this.buildWhere(options);
    return this.client.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { assignedToUser: { select: { name: true } } },
    });
  }

  async delete(id: number) {
    return runMapped(() => this.client.lead.delete({ where: { id } }), {
      notFound: `Lead #${id} tidak ditemukan`,
    });
  }

  async countByStatus() {
    const rows = await this.client.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const counts = new Map(rows.map((row) => [row.status, row._count._all]));
    return Object.fromEntries(
      Object.values(LeadStatus).map((status) => [
        status,
        counts.get(status) ?? 0,
      ])
    ) as Record<LeadStatus, number>;
  }

  async countByType() {
    const rows = await this.client.lead.groupBy({
      by: ["type"],
      _count: { _all: true },
    });
    const counts = Object.fromEntries(
      rows.map((row) => [row.type, row._count._all])
    );
    return Object.fromEntries(
      Object.values(LeadType).map((type) => [type, counts[type] ?? 0])
    ) as Record<LeadType, number>;
  }

  countNewSince(date: Date) {
    return this.client.lead.count({
      where: { status: "new", createdAt: { gte: date } },
    });
  }

  /** Counts all leads created within the [from, to) window (§28 daily snapshot). */
  countCreatedWithin(from: Date, to: Date) {
    return this.client.lead.count({
      where: { createdAt: { gte: from, lt: to } },
    });
  }

  /**
   * Counts leads per calendar month (grouped by `created_at`), last `months`
   * months (oldest first). Returns `{ label, value }[]` where label is an
   * unambiguous `YYYY-MM` string.
   */
  async countByMonth(months = 6): Promise<{ label: string; value: number }[]> {
    const since = new Date();
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    since.setMonth(since.getMonth() - (months - 1));

    const rows = await this.client.lead.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const d = row.createdAt;
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts.set(label, (counts.get(label) ?? 0) + row._count._all);
    }

    const labels: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      labels.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
    }

    return labels.map((label) => ({ label, value: counts.get(label) ?? 0 }));
  }
}

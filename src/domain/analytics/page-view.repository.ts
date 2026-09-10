import { PrismaClient } from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export interface PageViewRecord {
  path: string;
  visitorId?: string | null;
  ipAddress?: string | null;
  isBot?: boolean;
}

/** Repositories for raw page-view tracking (blueprint §28). */
export class PageViewRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async record(input: PageViewRecord) {
    return this.client.pageView.create({
      data: {
        path: input.path,
        visitorId: input.visitorId ?? null,
        ipAddress: input.ipAddress ?? null,
        isBot: input.isBot ?? false,
      },
    });
  }

  /**
   * Total non-bot page views within the [from, to) day window.
   */
  async countWithin(from: Date, to: Date): Promise<number> {
    return this.client.pageView.count({
      where: { isBot: false, createdAt: { gte: from, lt: to } },
    });
  }

  /**
   * Distinct non-bot visitors within the [from, to) window. A visitor without an
   * id (no cookie) is unknown and not counted as a unique visitor.
   */
  async countUniqueVisitors(from: Date, to: Date): Promise<number> {
    const rows = await this.client.pageView.groupBy({
      by: ["visitorId"],
      where: {
        isBot: false,
        visitorId: { not: null },
        createdAt: { gte: from, lt: to },
      },
      _count: { _all: true },
    });
    return rows.length;
  }

  /**
   * Top non-bot paths within the window, ordered by view count descending.
   */
  async topPaths(from: Date, to: Date, take = 10) {
    const rows = await this.client.pageView.groupBy({
      by: ["path"],
      where: { isBot: false, createdAt: { gte: from, lt: to } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take,
    });
    return rows.map((row) => ({ path: row.path, views: row._count._all }));
  }

  /**
   * Removes raw rows older than `retentionDays` (keeps the table bounded; the
   * daily snapshots already retain the aggregates indefinitely).
   */
  async deleteOlderThan(retentionDays: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    return this.client.pageView.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
  }
}
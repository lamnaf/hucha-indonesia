import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export interface AnalyticsSnapshotInput {
  date: Date;
  uniqueVisitors: number;
  pageViews: number;
  topArticles?: unknown;
  newLeadsCount?: number;
}

export class AnalyticsRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  /**
   * Nightly aggregation job: upsert one snapshot per calendar day.
   */
  async upsertDaily(input: AnalyticsSnapshotInput) {
    const date = new Date(input.date);
    date.setUTCHours(0, 0, 0, 0);
    return this.client.analyticsSnapshot.upsert({
      where: { date },
      update: {
        uniqueVisitors: input.uniqueVisitors,
        pageViews: input.pageViews,
        topArticles: input.topArticles as Prisma.InputJsonValue,
        newLeadsCount: input.newLeadsCount ?? 0,
      },
      create: {
        date,
        uniqueVisitors: input.uniqueVisitors,
        pageViews: input.pageViews,
        topArticles: input.topArticles as Prisma.InputJsonValue,
        newLeadsCount: input.newLeadsCount ?? 0,
      },
    });
  }

  listBetween(dateFrom: Date, dateTo: Date) {
    return this.client.analyticsSnapshot.findMany({
      where: { date: { gte: dateFrom, lte: dateTo } },
      orderBy: { date: "asc" },
    });
  }

  latest() {
    return this.client.analyticsSnapshot.findFirst({
      orderBy: { date: "desc" },
    });
  }
}

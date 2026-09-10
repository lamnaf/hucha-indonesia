import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export class SettingRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const setting = await this.client.setting.findUnique({ where: { key } });
    return setting ? (setting.value as T) : null;
  }

  async set(key: string, value: unknown) {
    return this.client.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });
  }

  getAll() {
    return this.client.setting.findMany({ orderBy: { key: "asc" } });
  }
}

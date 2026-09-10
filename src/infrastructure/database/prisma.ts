import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/infrastructure/database/generated/client";
import { config } from "@/config/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
    ssl: config.appEnv === "production",
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (config.appEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

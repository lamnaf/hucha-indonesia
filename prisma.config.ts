import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `DIRECT_URL` wins when set so Prisma CLI (migrate/seed/status) can use
    // Neon's direct connection while the Next.js runtime keeps the pooled
    // `DATABASE_URL`. Falls back to `DATABASE_URL` otherwise.
    url: process.env.DIRECT_URL || env("DATABASE_URL"),
  },
});

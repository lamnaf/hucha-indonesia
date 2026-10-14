import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/infrastructure/database/generated/client";
import { config } from "./src/config/env";

const OLD_PREFIX = "https://pub-07c9ef9aa5de42ba93def75e66dd3919.r2.dev/";
const rawNewPrefix = process.env.STORAGE_PUBLIC_URL || "https://media.huchaindonesia.com/";
const NEW_PREFIX = rawNewPrefix.endsWith("/") ? rawNewPrefix : `${rawNewPrefix}/`;

const CONCURRENCY_LIMIT = 5;
const TIMEOUT_MS = 5000;

type AuditStatus = "AVAILABLE" | "NOT_FOUND" | "UNKNOWN";

async function checkObject(url: string): Promise<{ status: AuditStatus; statusCode?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Try HEAD first
    let response = await fetch(url, { method: "HEAD", signal: controller.signal });

    // If HEAD is not supported (405 or 501), fallback to GET with minimal read
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: "GET", signal: controller.signal });
      // We don't need the body, just cancel it if possible
      if (response.body) {
        await response.body.cancel();
      }
    }

    if (response.ok) return { status: "AVAILABLE", statusCode: response.status };
    if (response.status === 404) return { status: "NOT_FOUND", statusCode: response.status };
    return { status: "UNKNOWN", statusCode: response.status };
  } catch {
    return { status: "UNKNOWN" };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const isCheckMode = process.argv.includes("--check-objects");
  const isAvailableOnly = process.argv.includes("--available-only");
  const isProduction = config.appEnv === "production" || process.env.NODE_ENV === "production";

  // Connection handling: use DIRECT_URL with fallback to DATABASE_URL
  const directUrl = process.env.DIRECT_URL;
  const databaseUrl = process.env.DATABASE_URL;
  
  let connectionString: string;
  if (directUrl) {
    connectionString = directUrl;
  } else if (databaseUrl) {
    connectionString = databaseUrl;
  } else {
    throw new Error("No connection string found (DATABASE_URL or DIRECT_URL must be set).");
  }

  // Safety validation: reject localhost in production environment
  const urlParts = new URL(connectionString.replace('postgresql://', 'http://').replace('postgres://', 'http://'));
  const isLocalhost = urlParts.hostname === 'localhost' || urlParts.hostname === '127.0.0.1';

  if (isProduction && isLocalhost) {
    throw new Error("REJECTED: Attempting to connect to localhost in production environment.");
  }

  console.log(`Environment: ${config.appEnv}`);
  console.log(`Host: ${urlParts.hostname}`);

  const adapter = new PrismaPg({
    connectionString,
    ssl: isProduction || connectionString.includes("neon.tech"),
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const all = await prisma.media.findMany({
      where: {
        filePath: { startsWith: OLD_PREFIX }
      },
      select: { id: true, filePath: true }
    });

    console.log(`Found ${all.length} media records matching old prefix.`);
    if (all.length === 0) {
      console.log("No records need migration/audit.");
      return;
    }

    if (isCheckMode) {
      console.log(`Auditing ${all.length} objects with concurrency ${CONCURRENCY_LIMIT}...`);
      const summary = { AVAILABLE: 0, NOT_FOUND: 0, UNKNOWN: 0 };
      
      // Basic concurrency control
      for (let i = 0; i < all.length; i += CONCURRENCY_LIMIT) {
        const chunk = all.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(chunk.map(async (m) => {
          const newUrl = m.filePath.replace(OLD_PREFIX, NEW_PREFIX);
          const { status, statusCode } = await checkObject(newUrl);
          summary[status]++;
          console.log(`[${status}] ID #${m.id} | HTTP ${statusCode ?? "???"} | ${newUrl}`);
        }));
      }

      console.log("\nAudit Summary:");
      console.log(`- AVAILABLE: ${summary.AVAILABLE}`);
      console.log(`- NOT_FOUND: ${summary.NOT_FOUND}`);
      console.log(`- UNKNOWN:   ${summary.UNKNOWN}`);
      return;
    }

    if (isAvailableOnly) {
      console.log(`Checking availability of ${all.length} objects with concurrency ${CONCURRENCY_LIMIT}...`);
      const toUpdate: typeof all = [];
      const counts = { AVAILABLE: 0, NOT_FOUND: 0, UNKNOWN: 0 };

      // Basic concurrency control
      for (let i = 0; i < all.length; i += CONCURRENCY_LIMIT) {
        const chunk = all.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(chunk.map(async (m) => {
          const newUrl = m.filePath.replace(OLD_PREFIX, NEW_PREFIX);
          const { status } = await checkObject(newUrl);
          counts[status]++;
          if (status === "AVAILABLE") {
            toUpdate.push(m);
          }
        }));
      }

      console.log("\nAvailability Summary:");
      console.log(`- AVAILABLE (to update): ${counts.AVAILABLE}`);
      console.log(`- NOT_FOUND (skipped):   ${counts.NOT_FOUND}`);
      console.log(`- UNKNOWN (skipped):     ${counts.UNKNOWN}`);

      if (isDryRun) {
        console.log("\nDry run mode: No changes will be applied.");
        console.log("Records that would be updated:");
        toUpdate.forEach(m => {
          console.log(`  - [ID #${m.id}] ${m.filePath} -> ${m.filePath.replace(OLD_PREFIX, NEW_PREFIX)}`);
        });
        return;
      }

      if (toUpdate.length === 0) {
        console.log("\nNo records to update.");
        return;
      }

      console.log(`\nUpdating ${toUpdate.length} available records in a transaction...`);
      const updatedCount = await prisma.$transaction(async (tx) => {
        let count = 0;
        for (const media of toUpdate) {
          const newPath = media.filePath.replace(OLD_PREFIX, NEW_PREFIX);
          await tx.media.update({
            where: { id: media.id },
            data: { filePath: newPath }
          });
          count++;
        }
        return count;
      });

      console.log(`Successfully updated ${updatedCount} records.`);
      
      // Final verification for old prefix (should be same as before minus updated count)
      const remaining = await prisma.media.count({
        where: { filePath: { startsWith: OLD_PREFIX } }
      });
      
      if (remaining > 0) {
        console.warn(`Warning: ${remaining} records still have the old prefix (these were skipped due to availability).`);
      } else {
        console.log("Verification successful: No records with old prefix remaining.");
      }
      return;
    }

    if (isDryRun) {
      console.log("Dry run mode: No changes will be applied.");
      console.log("All record transformations:");
      all.forEach(m => {
        console.log(`  - [ID #${m.id}] ${m.filePath} -> ${m.filePath.replace(OLD_PREFIX, NEW_PREFIX)}`);
      });
      return;
    }

    console.log("Executing migration in a transaction...");
    
    const results = await prisma.$transaction(async (tx) => {
      let updatedCount = 0;
      for (const media of all) {
        const newPath = media.filePath.replace(OLD_PREFIX, NEW_PREFIX);
        await tx.media.update({
          where: { id: media.id },
          data: { filePath: newPath }
        });
        updatedCount++;
      }
      return updatedCount;
    });

    console.log(`Successfully updated ${results} records.`);
    
    // Final verification
    const remaining = await prisma.media.count({
      where: { filePath: { startsWith: OLD_PREFIX } }
    });
    
    if (remaining > 0) {
      console.warn(`Warning: ${remaining} records still have the old prefix.`);
    } else {
      console.log("Verification successful: No records with old prefix remaining.");
    }

  } catch (error: unknown) {
    console.error("Operation failed:");
    if (error instanceof Error) {
      console.error(error.message);
    }
    if (typeof error === 'object' && error !== null) {
      const safe = error as Record<string, unknown>;
      if (safe.code) console.error(`Prisma error code: ${safe.code}`);
      if (safe.name) console.error(`Error name: ${safe.name}`);
      if (safe.clientVersion) console.error(`Prisma Client version: ${safe.clientVersion}`);
      if (safe.meta && typeof safe.meta === 'object' && safe.meta !== null) {
        console.error("Error metadata:", JSON.stringify(safe.meta, null, 2));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
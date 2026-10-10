import "dotenv/config";
import { prisma } from "./src/infrastructure/database/prisma";
import { config } from "./src/config/env";

const OLD_PREFIX = "https://pub-07c9ef9aa5de42ba93def75e66dd3919.r2.dev/";
const NEW_PREFIX = process.env.STORAGE_PUBLIC_URL || "https://media.huchaindonesia.com/";

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  
  console.log(`Targeting database: ${config.databaseUrl.split('@')[1] || 'unknown'}`);
  console.log(`Environment: ${config.appEnv}`);

  try {
    const all = await prisma.media.findMany({
      where: {
        filePath: { startsWith: OLD_PREFIX }
      },
      select: { id: true, filePath: true }
    });

    console.log(`Found ${all.length} media records to update.`);
    if (all.length > 0) {
      console.log(`Example: ${all[0].filePath} -> ${all[0].filePath.replace(OLD_PREFIX, NEW_PREFIX)}`);
    }

    if (isDryRun) {
      console.log("Dry run mode: No changes made.");
      return;
    }

    let count = 0;
    for (const media of all) {
      const newPath = media.filePath.replace(OLD_PREFIX, NEW_PREFIX);
      await prisma.media.update({
        where: { id: media.id },
        data: { filePath: newPath }
      });
      count++;
    }
    console.log(`Successfully updated ${count} records.`);
  } catch (error) {
    console.error("Migration failed:");
    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
      console.error("Error: Connection to database refused. Check if your database is running.");
    } else {
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

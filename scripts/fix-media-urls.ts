import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma";

const NEW_PREFIX = "https://pub-07c9ef9aa5de42ba93def75e66dd3919.r2.dev/";
const BROKEN = "r2.cloudflarestorage.com";

async function main() {
  const all = await prisma.media.findMany({ select: { id: true, filePath: true } });
  let updated = 0;
  for (const media of all) {
    const fp = media.filePath;
    if (fp.includes(BROKEN) || fp.includes("\n")) {
      const key = fp.split("/").pop()?.split("\n").pop() ?? "";
      const newPath = NEW_PREFIX + key;
      await prisma.media.update({ where: { id: media.id }, data: { filePath: newPath } });
      updated++;
      console.log(`#${media.id}: FIXED -> ${newPath}`);
    }
  }
  console.log(`\nTotal updated: ${updated}/${all.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma";

async function main() {
  const all = await prisma.media.findMany({ select: { id: true, filePath: true } });
  for (const m of all) {
    console.log(`#${m.id}: [${m.filePath}]`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

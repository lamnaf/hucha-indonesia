import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/infrastructure/database/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const lubesCat = await prisma.category.findUnique({ where: { slug: "lubricants" } });
  if (!lubesCat) {
    console.error("Lubricants category not found!");
    return;
  }

  // Move oil/lubricant products to lubricants category
  const productsToMove = [
    "oli-mesin-hucha-matic-10w-30",
    "oli-sokbreker-hucha-sae-20",
    "transmission-gear-oil-matic-motor",
    "shock-absorber-oil-motor"
  ];

  for (const slug of productsToMove) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: lubesCat.id }
      });
      console.log(`Moved ${slug} to lubricants category`);
    }
  }

  await prisma.$disconnect();
}

main();

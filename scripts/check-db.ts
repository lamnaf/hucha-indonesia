import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/infrastructure/database/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cats = await prisma.category.findMany({ orderBy: { id: "asc" } });
  console.log("---categories---");
  for (const c of cats) {
    console.log(`${c.id} ${c.slug} ${c.type} parent=${c.parentId}`);
  }
  const prods = await prisma.product.findMany({ include: { category: true, subCategory: true } });
  console.log("---products---");
  for (const p of prods) {
    console.log(`${p.slug} cat=${p.category.slug}(${p.category.type}) sub=${p.subCategory?.slug ?? "none"}`);
  }
  const brands = await prisma.brand.findMany();
  console.log("---brands---");
  for (const b of brands) {
    console.log(`${b.slug} ${b.category}`);
  }
  await prisma.$disconnect();
}

main();

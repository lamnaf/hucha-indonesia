import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/infrastructure/database/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create lubricants category
  const lubricants = await prisma.category.create({
    data: { name: "Lubricants", slug: "lubricants", type: "lubricants" }
  });
  console.log(`Created category: ${lubricants.id} ${lubricants.slug} ${lubricants.type}`);

  // List all categories
  const cats = await prisma.category.findMany({ orderBy: { id: "asc" } });
  console.log("\n---All categories---");
  for (const c of cats) {
    console.log(`${c.id} ${c.slug} ${c.type} parent=${c.parentId}`);
  }

  // Update huca-lubricants brand to use lubricants category
  const brand = await prisma.brand.findFirst({ where: { slug: "hucha-lubricants" } });
  console.log(`\nBrand before: ${brand?.slug} category=${brand?.category}`);
  if (brand) {
    const updated = await prisma.brand.update({
      where: { id: brand.id },
      data: { category: "lubricants" }
    });
    console.log(`Brand updated: ${updated.slug} category=${updated.category}`);
  }

  // List brands
  const brands = await prisma.brand.findMany();
  console.log("\n---Brands---");
  for (const b of brands) {
    console.log(`${b.slug} ${b.category}`);
  }

  await prisma.$disconnect();
}

main();

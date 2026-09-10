import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { CategoryRepository } from "@/domain/products/category.repository";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Produk Baru",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requireAdmin();

  const [categories, brands] = await Promise.all([
    new CategoryRepository().listTopLevel(),
    new BrandRepository().list({ pageSize: 100 }),
  ]);

  return (
    <ProductForm
      categories={categories}
      brands={brands.items.map((brand) => ({ id: brand.id, name: brand.name }))}
    />
  );
}

import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { ProductRepository } from "@/domain/products/product.repository";
import { CategoryRepository } from "@/domain/products/category.repository";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { NotFoundError } from "@/domain/errors";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Edit Produk",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    throw new NotFoundError("Produk tidak ditemukan");
  }

  const product = await new ProductRepository().findById(productId);
  if (!product) {
    throw new NotFoundError(`Produk #${productId} tidak ditemukan`);
  }

  const [categories, brands] = await Promise.all([
    new CategoryRepository().listTopLevel(),
    new BrandRepository().list({ pageSize: 100 }),
  ]);

  return (
    <ProductForm
      categories={categories}
      brands={brands.items.map((brand) => ({ id: brand.id, name: brand.name }))}
      initial={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        brandId: product.brandId,
        shortDescription: product.shortDescription,
        description: product.description,
        tokopediaUrl: product.tokopediaUrl,
        shopeeUrl: product.shopeeUrl,
        tiktokshopUrl: product.tiktokshopUrl,
        isFeatured: product.isFeatured,
        status: product.status,
        images: product.images.map((image) => ({
          id: image.mediaId,
          url: image.media.filePath,
        })),
      }}
    />
  );
}

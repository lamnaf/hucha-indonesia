import { Suspense } from "react";

import { pageMetadata } from "@/lib/seo";
import {
  getPublicCategories,
  getPublicProducts,
} from "@/lib/public/products";

import { Hero } from "@/components/hero";
import { ProductCatalog } from "@/components/product-catalog";

export const metadata = pageMetadata({
  title: "Katalog Produk",
  description:
    "Jelajahi katalog produk HuCha Indonesia — spareparts, cairan otomotif, dan perawatan kendaraan. Belanja langsung di marketplace resmi.",
  path: "/produk",
});

export default async function Products() {
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
  ]);

  return (
    <>
      <Hero
        align="center"
        badge="Produk"
        title="Katalog Produk HuCha Indonesia"
        description="Cari produk sesuai kategori atau kata kunci, lalu belanja langsung dari marketplace resmi kami."
      />
      <section className="border-t bg-muted/40 py-12 sm:py-16">
        <div className="container">
          <Suspense
            fallback={
              <div className="text-muted-foreground text-sm">
                Memuat katalog produk...
              </div>
            }
          >
            <ProductCatalog products={products} categories={categories} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, PackageIcon } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getBrandProductGroups, getPublicBrands } from "@/lib/public/brands";
import { brandCategoryIndex } from "@/lib/mock/brands";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { MediaPlaceholder } from "@/components/media-placeholder";

export const metadata = pageMetadata({
  title: "Merek Kami",
  description:
    "Mengenal lini merek HuCha — HuCha Racing, HuCha Lubricants, dan HuCha Auto Care untuk suku cadang, cairan otomotif, dan perawatan kendaraan.",
  path: "/merek-kami",
});

export default async function Brands() {
  const [brands, groups] = await Promise.all([
    getPublicBrands(),
    getBrandProductGroups(),
  ]);

  return (
    <>
      <Hero
        align="center"
        badge="Merek Kami"
        title="Lini Produk di Bawah HuCha Indonesia"
        description="Setiap merek kami dirancang untuk kebutuhan spesifik — dari performa balap hingga perawatan harian motor Anda."
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container grid gap-6 sm:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.name} className="gap-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {brand.icon ? (
                    <img
                      src={brand.icon}
                      alt={brand.name}
                      className="size-14 rounded-lg object-cover"
                    />
                  ) : (
                    <MediaPlaceholder
                      icon={<PackageIcon />}
                      aspect="square"
                      className="size-14 rounded-lg"
                    />
                  )}
                  <div>
                    <CardTitle>{brand.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {brand.tagline}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {brandCategoryIndex[brand.category].name}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-muted-foreground text-sm">
                  {brand.description}
                </p>
                <ul className="space-y-1.5">
                  {brand.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <CheckIcon
                        className="text-primary size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-auto w-fit">
                  <Link href={brandCategoryIndex[brand.category].href}>
                    Jelajahi {brandCategoryIndex[brand.category].name}
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container space-y-16">
          {groups.map(({ brand, category, products: brandProducts }) => (
            <div key={brand.name} className="space-y-8">
              <SectionHeading
                eyebrow={category.name}
                title={brand.name}
                description={brand.description}
                link={{
                  label: "Lihat semua produk",
                  href: brandCategoryIndex[brand.category].href,
                }}
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {brandProducts.length > 0 ? (
                  brandProducts.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-sm">
                    Produk pada lini ini akan segera hadir.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

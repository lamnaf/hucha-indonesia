import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageIcon, WrenchIcon } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import {
  getProductBySlug,
  getPublicProducts,
} from "@/lib/public/products";
import { categoryTypeLabel } from "@/lib/mock/products";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { MarketplaceBadges } from "@/components/marketplace-badges";
import { ProductCard } from "@/components/product-card";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/breadcrumb";

interface ProductDetailProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {};
  }
  return pageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/produk/${product.slug}`,
  });
}

export default async function ProductDetail({ params }: ProductDetailProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getProductBySlug(slug),
    getPublicProducts(),
  ]);
  if (!product) {
    notFound();
  }

  const categoryName = categoryTypeLabel[product.category];
  const related = products.filter(
    (item) => item.category === product.category && item.slug !== product.slug
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    category: categoryName,
  };

  return (
    <>
      <section className="border-b py-12 sm:py-16">
        <div className="container grid items-start gap-10 lg:grid-cols-2">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full rounded-xl object-cover"
            />
          ) : (
            <MediaPlaceholder
              icon={<PackageIcon />}
              aspect="square"
              className="rounded-xl"
              label={product.name}
            />
          )}
          <div className="space-y-5">
            <Breadcrumb
              items={[
                { label: "Produk", href: "/produk" },
                {
                  label: categoryTypeLabel[product.category],
                  href: `/produk?kategori=${product.category}`,
                },
                { label: product.name },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/produk">
                <Badge variant="outline">Semua Produk</Badge>
              </Link>
              <Link href={`/produk?kategori=${product.category}`}>
                <Badge variant="secondary">
                  {categoryTypeLabel[product.category]}
                </Badge>
              </Link>
              <Badge variant="secondary">{product.subcategory}</Badge>
            </div>
            <h1 className="text-balance text-3xl sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              {product.shortDescription}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>
            <div className="border-t pt-5">
              <p className="mb-3 text-sm font-semibold">
                Beli di marketplace resmi:
              </p>
              <MarketplaceBadges
                tiktokshopUrl={product.tiktokshopUrl}
              />
            </div>
            <div className="border-t pt-5">
              <p className="text-muted-foreground text-sm">
                Butuh dalam jumlah banyak?{" "}
                <Link
                  href="/kemitraan"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  Jadi mitra distributor
                </Link>{" "}
                atau tanyakan via{" "}
                <Link
                  href="/kontak"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  kontak kami
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="container">
            title={`Produk ${categoryName} Lainnya`}
            link={{
              label: "Lihat semua produk",
              href: `/produk?kategori=${product.category}`,
            }}
          />
          {related.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <WrenchIcon
                  className="text-muted-foreground size-6"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold">
                    Belum ada produk lain di kategori ini
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Jelajahi katalog lengkap kami untuk menemukan produk
                    lainnya.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/produk">Jelajahi Katalog</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <JsonLd data={productJsonLd} />
    </>
  );
}

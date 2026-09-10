import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  HandshakeIcon,
  PackageCheckIcon,
  QuoteIcon,
  TruckIcon,
  WrenchIcon,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/lib/public/site";
import {
  getPublicCategories,
  getFeaturedProducts,
} from "@/lib/public/products";
import { getPublicBrands } from "@/lib/public/brands";
import { getPublicTestimonials } from "@/lib/public/testimonials";
import { getArticlesNewestFirst } from "@/lib/public/blog";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { ArticleCard } from "@/components/article-card";
import { StarRating } from "@/components/star-rating";
import { MediaPlaceholder } from "@/components/media-placeholder";

export const metadata = pageMetadata({
  title: "Suku Cadang Motor, Cairan Otomotif & Autocare Terpercaya",
  description:
    "HuCha Indonesia — distributor resmi suku cadang motor, cairan otomotif, dan produk perawatan kendaraan berkualitas untuk bengkel, toko onderdil, dan komunitas motor di seluruh Indonesia.",
  path: "/",
});

const valueProps = [
  {
    icon: BadgeCheckIcon,
    title: "Kualitas Terjamin",
    description:
      "Setiap produk melalui kontrol kualitas ketat dan dijual melalui jalur distribusi resmi.",
  },
  {
    icon: TruckIcon,
    title: "Distribusi Luas",
    description:
      "Jaringan distributor dan mitra toko di berbagai wilayah di Indonesia.",
  },
  {
    icon: HandshakeIcon,
    title: "Kemitraan Mudah",
    description:
      "Program kemitraan distributor yang transparan dengan dukungan penuh untuk mitra.",
  },
  {
    icon: PackageCheckIcon,
    title: "Marketplace Resmi",
    description:
      "Tersedia di Tokopedia, Shopee, dan TikTok Shop untuk memudahkan pembelian Anda.",
  },
];

export default async function Home() {
  const [siteConfig, categories, featured, brands, testimonials, articles] =
    await Promise.all([
      getSiteConfig(),
      getPublicCategories(),
      getFeaturedProducts(),
      getPublicBrands(),
      getPublicTestimonials(),
      getArticlesNewestFirst(),
    ]);

  return (
    <>
      <Hero
        badge="Distributor Resmi Spareparts & Autocare Motor"
        title="Perawatan Motor Berkualitas untuk Jalanan Indonesia"
        description={`${siteConfig.description} Belanja langsung dari toko marketplace resmi atau jadilah mitra distributor kami.`}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/produk">Lihat Produk</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/kemitraan">Jadi Distributor</Link>
            </Button>
          </>
        }
        visual={
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.slice(0, 2).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        }
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Kategori"
            title="Lini Produk Kami"
            description="Tiga kategori utama produk otomotif untuk memenuhi kebutuhan motor Anda."
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.slug} className="group overflow-hidden gap-0">
                <Link href={`/produk?kategori=${category.type}`}>
                  <MediaPlaceholder
                    label={category.name}
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </Link>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-muted-foreground text-sm">
                    {category.subcategories.join(" · ")}
                  </p>
                  <Button asChild variant="outline" className="w-fit">
                    <Link href={`/produk?kategori=${category.type}`}>
                      Jelajahi {category.name}
                      <ArrowRightIcon className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Produk Unggulan"
            title="Pilihan Terbaik Kami"
            description="Produk terlaris yang paling direkomendasikan pelanggan dan mitra kami."
            link={{ label: "Lihat semua produk", href: "/produk" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Mengapa HuCha"
            title="Mitra Terpercaya Bengkel & Toko Onderdil"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="gap-4">
                <CardHeader>
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Merek Kami"
            title="Brands di Bawah Naungan Kami"
            description="Lini produk kami hadir untuk setiap kebutuhan — dari performa hingga perawatan harian."
            link={{ label: "Lihat merek kami", href: "/merek-kami" }}
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {brands.map((brand) => (
              <Card key={brand.name} className="gap-4">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-lg">
                      <WrenchIcon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {brand.tagline}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {brand.description}
                  </p>
                  <Link
                    href="/merek-kami"
                    className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-medium"
                  >
                    Selengkapnya
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-primary text-primary-foreground py-16 sm:py-20">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="text-balance max-w-2xl text-3xl font-bold tracking-tight">
            Ingin Menjadi Distributor atau Mitra Bengkel?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl">
            Bergabunglah dengan jaringan distributor HuCha Indonesia dan
            dapatkan dukungan penuh untuk mengembangkan usaha Anda.
          </p>
          <Button asChild size="lg" variant="default">
            <Link href="/kemitraan">Daftar Jadi Distributor</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Testimoni"
            title="Kata Mitra Kami"
            description="Kepercayaan dari bengkel dan toko onderdil di seluruh Indonesia."
            link={{ label: "Lihat semua testimoni", href: "/testimoni" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.partnerName} className="gap-4">
                <CardContent className="flex flex-1 flex-col gap-4">
                  <QuoteIcon
                    className="text-muted-foreground/50 size-6"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="mt-auto">
                    <StarRating rating={testimonial.rating} />
                    <p className="mt-2 text-sm font-semibold">
                      {testimonial.partnerName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.partnerBusiness} ·{" "}
                      {testimonial.partnerRegion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Blog"
            title="Tips & Berita Terbaru"
            description="Artikel seputar perawatan motor dan informasi terbaru dari HuCha Indonesia."
            link={{ label: "Kunjungi blog", href: "/blog" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles
              .slice(0, 3)
              .map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}

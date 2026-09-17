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
import {
  getPublicCategories,
  getFeaturedProducts,
} from "@/lib/public/products";
import { getPublicBrands } from "@/lib/public/brands";
import { getPublicTestimonials } from "@/lib/public/testimonials";
import { getArticlesNewestFirst } from "@/lib/public/blog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { ArticleCard } from "@/components/article-card";
import { StarRating } from "@/components/star-rating";
import { MediaPlaceholder } from "@/components/media-placeholder";
import Image from "next/image";

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
  const [categories, featured, brands, testimonials, articles] =
    await Promise.all([
      getPublicCategories(),
      getFeaturedProducts(),
      getPublicBrands(),
      getPublicTestimonials(),
      getArticlesNewestFirst(),
    ]);

  return (
    <>
      <section className="relative flex min-h-[640px] items-center overflow-hidden bg-[url('/background.jpeg')] bg-cover bg-no-repeat bg-center text-white py-20 md:py-24">
        <div className="absolute inset-0 bg-navy-dark/60" aria-hidden="true" />
        <div className="container relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-6 text-left">
            <div className="flex flex-col gap-1">
              <div className="flex items-start">
                <span className="font-dynamo text-6xl sm:text-7xl lg:text-8xl uppercase tracking-wider text-white italic font-extrabold">
                  HuCha
                </span>
                <span className="text-xs sm:text-sm text-white font-sans font-bold ml-0.5 mt-2">®</span>
              </div>
              <span className="font-dynamo text-xl sm:text-2xl uppercase italic tracking-widest text-white font-bold -mt-2 sm:-mt-3">
                Built to Protect
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase leading-[1.15] tracking-wide text-white">
              PERLINDUNGAN DAN PERAWATAN UNTUK SETIAP KENDARAAN
            </h1>
            <p className="max-w-xl text-lg sm:text-xl leading-relaxed tracking-wide text-white/90">
              Produk cairan dan perawatan dari HUCHA untuk kebutuhan bengkel, toko spareparts, distributor, dan pengguna di Indonesia
            </p>
          </div>
          <div className="relative h-[320px] sm:h-[400px] lg:h-[520px]">
            <Image
              src="/orang.png"
              alt="HuCha Representatives"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain object-center drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-t bg-navy-dark py-16 sm:py-20 text-white">
        <div className="container">
          <SectionHeading
            eyebrow="Kategori"
            title={<span className="text-white">Lini Produk Kami</span>}
            description={<span className="text-white/80">Empat kategori utama produk otomotif untuk memenuhi kebutuhan motor Anda.</span>}
            align="center"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.slug} className="group overflow-hidden gap-0 flex flex-col h-full">
                <Link href={`/produk?kategori=${category.type}`}>
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <MediaPlaceholder
                      label={category.name}
                      className="h-32 w-full transition-transform duration-300 group-hover:scale-[1.02] bg-primary/10 border-primary/20 rounded-lg flex items-center justify-center"
                    />
                  )}
                </Link>
                <CardContent className="flex flex-col flex-1 gap-4 p-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {category.subcategories.join(" · ")}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/produk?kategori=${category.type}`}>
                      Jelajahi {category.name}
                      <ArrowRightIcon className="size-4 ml-2" aria-hidden="true" />
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

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Mengapa HuCha"
            title="Mitra Terpercaya Bengkel & Toko Onderdil"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full mb-4">
                  <Icon className="size-8" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {description}
                </p>
              </div>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((brand) => (
              <Card key={brand.name} className="flex h-full flex-col gap-4">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {brand.icon ? (
                      <img
                        src={brand.icon}
                        alt={brand.name}
                        className="size-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                        <WrenchIcon className="size-6" aria-hidden="true" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {brand.tagline}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
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
          <p className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Strategi Terbaik
          </p>
          <h2 className="text-balance max-w-2xl text-3xl sm:text-4xl uppercase tracking-wider font-heading leading-none">
            Ingin Menjadi Distributor Resmi?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl">
            Bergabunglah dengan jaringan distributor HuCha Indonesia dan
            dapatkan dukungan penuh untuk mengembangkan usaha Anda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/kemitraan">Jadi Distributor</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/kontak">Konsultasi Gratis</Link>
            </Button>
          </div>
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

      <section className="border-t bg-navy-dark py-16 sm:py-20 text-white">
        <div className="container">
          <SectionHeading
            eyebrow="Blog"
            title={<span className="text-white">Tips & Berita Terbaru</span>}
            description={<span className="text-white/80">Artikel seputar perawatan motor dan informasi terbaru dari HuCha Indonesia.</span>}
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
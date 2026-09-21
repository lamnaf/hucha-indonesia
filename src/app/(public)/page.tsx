import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  HandshakeIcon,
  PackageCheckIcon,
  TruckIcon,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import {
  getPublicCategories,
  getFeaturedProducts,
} from "@/lib/public/products";
import { getArticlesNewestFirst } from "@/lib/public/blog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { ArticleCard } from "@/components/article-card";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { PartnerSlider } from "@/components/partner-slider";
import Image from "next/image";

export const metadata = pageMetadata({
  title: "Suku Cadang Motor, Cairan Otomotif & Autocare Terpercaya",
  description:
    "HuCha Indonesia — merek perawatan otomotif untuk perlindungan dan perawatan kendaraan di seluruh Indonesia.",
  path: "/",
});

const whyHucha = [
  {
    icon: BadgeCheckIcon,
    title: "Kualitas Terjamin",
    description:
      "Setiap produk melalui kontrol kualitas ketat — dirancang untuk melindungi kendaraan Anda secara nyata.",
  },
  {
    icon: TruckIcon,
    title: "Jangkauan Luas",
    description:
      "Tersedia di berbagai wilayah Indonesia, baik melalui mitra toko maupun marketplace resmi.",
  },
  {
    icon: HandshakeIcon,
    title: "Kemitraan Jangka Panjang",
    description:
      "Kami membangun hubungan berdasarkan kepercayaan, bukan sekadar transaksi.",
  },
  {
    icon: PackageCheckIcon,
    title: "Solusi Praktis",
    description:
      "Produk yang menjalankan fungsinya — tanpa klaim berlebihan, dengan nilai nyata untuk pelanggan.",
  },
];

export default async function Home() {
  const [categories, featured, articles] = await Promise.all([
    getPublicCategories(),
    getFeaturedProducts(),
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
              Produk perawatan otomotif dari HUCHA untuk bengkel, toko spareparts, dan pengguna kendaraan di Indonesia
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
            title={<span className="text-white">Produk Hucha</span>}
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

      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container">
          <SectionHeading
            title="Kenapa Hucha"
            description="Kami percaya produk yang baik harus melakukan lebih dari sekadar menjalankan fungsinya. Berikut alasan mitra memilih kami."
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyHucha.map(({ icon: Icon, title, description }) => (
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

      <section className="border-y bg-primary text-primary-foreground py-16 sm:py-20">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="text-balance max-w-2xl text-3xl sm:text-4xl uppercase tracking-wider font-heading leading-none">
            Ingin Menjadi Mitra Kami?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl">
            Bergabunglah dengan jaringan mitra HuCha Indonesia dan
            dapatkan dukungan penuh untuk mengembangkan usaha Anda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/kemitraan">Lihat Program Kemitraan</Link>
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
            title="Tumbuh Bersama HUCHA"
            description="Cerita dan pengalaman mitra bengkel, toko, dan distributor di seluruh Indonesia."
            align="center"
          />
          <PartnerSlider />
        </div>
      </section>

      <section className="border-t bg-navy-dark py-16 sm:py-20 text-white">
        <div className="container">
          <SectionHeading
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

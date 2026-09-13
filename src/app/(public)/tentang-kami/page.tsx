import Link from "next/link";
import {
  AwardIcon,
  Building2Icon,
  CheckCircle2Icon,
  FactoryIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/lib/public/site";
import { getPublicTestimonials } from "@/lib/public/testimonials";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { StarRating } from "@/components/star-rating";

export const metadata = pageMetadata({
  title: "Tentang Kami",
  description:
    "Kenali HuCha Indonesia (CV Usaha Bintang Mulia) — distributor suku cadang motor, cairan otomotif, dan produk perawatan kendaraan yang terpercaya di Indonesia.",
  path: "/tentang-kami",
});

const milestones = [
  {
    year: "2015",
    title: "Berdirinya Usaha",
    description:
      "CV Usaha Bintang Mulia didirikan di Pasuruan dengan fokus pada distribusi suku cadang motor berkualitas.",
  },
  {
    year: "2018",
    title: "Merek HuCha Lahir",
    description:
      "Meluncurkan merek HuCha untuk cairan otomotif dan mulai memperluas jaringan distributor.",
  },
  {
    year: "2021",
    title: "Perluasan Kategori",
    description:
      "Menambah lini produk perawatan kendaraan (autocare) dan membuka layanan OEM/maklon.",
  },
  {
    year: "2024",
    title: "Jangkauan Nasional",
    description:
      "Bermitra dengan ratusan toko onderdil dan bengkel di berbagai provinsi di Indonesia.",
  },
];

const values = [
  {
    icon: CheckCircle2Icon,
    title: "Kualitas",
    description:
      "Kami hanya mendistribusikan produk yang lolos kontrol mutu ketat, demi kepercayaan pelanggan.",
  },
  {
    icon: UsersIcon,
    title: "Kemitraan",
    description:
      "Keberhasilan mitra distributor dan bengkel adalah keberhasilan kami.",
  },
  {
    icon: TargetIcon,
    title: "Integritas",
    description:
      "Transparan dalam harga, produk, dan setiap kerja sama yang kami jalani.",
  },
  {
    icon: FactoryIcon,
    title: "Inovasi",
    description:
      "Terus mengembangkan produk dan layanan untuk kebutuhan pasar otomotif Indonesia.",
  },
];

export default async function About() {
  const [siteConfig, testimonials] = await Promise.all([
    getSiteConfig(),
    getPublicTestimonials(),
  ]);

  return (
    <>
      <Hero
        align="center"
        badge="Tentang Kami"
        title="Dedikasi untuk Perawatan Motor Indonesia"
        description={`${siteConfig.name} beroperasi di bawah ${siteConfig.legalName}, sebuah perusahaan distribusi yang berfokus pada suku cadang motor, cairan otomotif, dan produk perawatan kendaraan.`}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/produk">Lihat Produk</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/kontak">Hubungi Kami</Link>
            </Button>
          </>
        }
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <Badge variant="outline">Visi & Misi</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Visi Kami
            </h2>
            <p className="text-muted-foreground text-pretty">
              Menjadi distributor terkemuka di Indonesia dalam menyediakan
              produk otomotif berkualitas tinggi yang mendukung kenyamanan dan
              keselamatan berkendara.
            </p>
            <h3 className="pt-2 text-xl font-bold tracking-tight">Misi Kami</h3>
            <ul className="space-y-2">
              {[
                "Menyediakan produk original dengan kualitas konsisten.",
                "Membangun kemitraan yang saling menguntungkan dengan distributor dan toko.",
                "Memberikan kemudahan akses melalui marketplace resmi dan jaringan fisik.",
                "Mendukung pertumbuhan industri otomotif Indonesia.",
              ].map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex gap-2 text-sm"
                >
                  <CheckCircle2Icon
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <MediaPlaceholder
            icon={<Building2Icon />}
            label={siteConfig.legalName}
            aspect="square"
          />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Perjalanan"
            title="Perjalanan Kami"
            description="Langkah demi langkah membangun kepercayaan sejak awal berdiri."
            align="center"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((milestone) => (
              <Card key={milestone.year} className="gap-4">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {milestone.year}
                  </Badge>
                  <CardTitle className="text-base">{milestone.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {milestone.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Nilai Kami"
            title="Prinsip yang Kami Pegang"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
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
            eyebrow="Keunggulan"
            title="Kenapa Memilih Kami"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: AwardIcon,
                title: "Legalitas Jelas",
                description:
                  "Beroperasi sebagai badan usaha resmi dengan komitmen kualitas dan kepatuhan hukum.",
              },
              {
                icon: Building2Icon,
                title: "Tim Profesional",
                description:
                  "Didukung tim sales, logistik, dan dukungan pelanggan yang responsif.",
              },
              {
                icon: CheckCircle2Icon,
                title: "Produk Teruji",
                description:
                  "Setiap produk diuji sebelum didistribusikan ke seluruh Indonesia.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <Card key={title} className="items-center gap-4 text-center">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mx-auto flex size-10 items-center justify-center rounded-lg">
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

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Testimoni"
            title="Kepercayaan Mitra Kami"
            link={{ label: "Lihat semua", href: "/testimoni" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.partnerName} className="gap-4">
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="mt-auto">
                    <StarRating rating={testimonial.rating} />
                    <p className="mt-2 text-sm font-semibold">
                      {testimonial.partnerName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.partnerBusiness}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

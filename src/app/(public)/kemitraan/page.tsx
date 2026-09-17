import Link from "next/link";
import {
  CheckCircle2Icon,
  HeadphonesIcon,
  PercentIcon,
  QuoteIcon,
  RocketIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { whatsappChatLink } from "@/lib/whatsapp-link";
import { getPublicTestimonials } from "@/lib/public/testimonials";

import { Hero } from "@/components/hero";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { StarRating } from "@/components/star-rating";
import { DistributorForm } from "@/components/forms/distributor-form";

export const metadata = pageMetadata({
  title: "Kemitraan Distributor",
  description:
    "Jadilah distributor HuCha Indonesia. Dapatkan harga khusus, dukungan promosi, dan prioritas stok untuk mengembangkan usaha toko onderdil atau bengkel Anda.",
  path: "/kemitraan",
});

const benefits = [
  {
    icon: PercentIcon,
    title: "Harga Khusus Mitra",
    description:
      "Margin keuntungan yang kompetitif dengan harga khusus untuk distributor.",
  },
  {
    icon: TruckIcon,
    title: "Prioritas Stok",
    description:
      "Prioritas ketersediaan stok untuk produk unggulan setiap periode.",
  },
  {
    icon: RocketIcon,
    title: "Dukungan Promosi",
    description:
      "Materi promosi, spanduk, dan kampanye bersama untuk mendukung penjualan.",
  },
  {
    icon: HeadphonesIcon,
    title: "Pendampingan Tim Sales",
    description:
      "Tim sales mendampingi Anda mulai dari order, stok, hingga pemasaran.",
  },
];

const process = [
  {
    step: "1",
    title: "Daftar",
    description: "Isi formulir pendaftaran distributor dengan data usaha Anda.",
  },
  {
    step: "2",
    title: "Verifikasi",
    description:
      "Tim kami menghubungi untuk verifikasi wilayah dan bisnis Anda.",
  },
  {
    step: "3",
    title: "Kontrak & Order Awal",
    description: "Tandatangani kerja sama dan lakukan minimal pembelian awal.",
  },
  {
    step: "4",
    title: "Distribusi",
    description: "Mulai distribusi dengan dukungan penuh dari tim kami.",
  },
];

export default async function Distributor() {
  const testimonials = await getPublicTestimonials();
  const featuredTestimonial = testimonials[0];

  return (
    <>
      <Hero
        badge="Sukses Bersama HuCha"
        title="Membangun Bisnis. Membangun Kepercayaan. Bertumbuh Bersama."
        description={
          <div className="space-y-4">
            <p>
              HUCHA percaya bahwa keberhasilan sebuah brand tidak dapat dicapai sendirian. 
              Distributor adalah bagian penting dari perjalanan kami untuk membawa HUCHA lebih dekat 
              kepada konsumen di seluruh Indonesia.
            </p>
            <p>
              Karena itu, kami membangun kerja sama berdasarkan <strong>kepercayaan, dukungan, dan komitmen jangka panjang</strong>.
            </p>
            <p>
              Kami tidak hanya ingin produk HUCHA tersedia di lebih banyak tempat. Kami ingin 
              <strong> membangun bisnis yang sama-sama memberikan manfaat dan menciptakan kesuksesan 
              bagi HUCHA dan para mitra kami.</strong>
            </p>
            <p className="font-semibold italic">Your success is part of our success.</p>
          </div>
        }
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#daftar">Daftar Sekarang</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={whatsappChatLink(
                  "Halo HuCha Indonesia, saya tertarik menjadi distributor."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tanya via WhatsApp
              </a>
            </Button>
          </>
        }
        visual={
          featuredTestimonial ? (
            <Card className="gap-4">
              <CardHeader>
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <UsersIcon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-base">
                  {featuredTestimonial.partnerName}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  &quot;{featuredTestimonial.quote}&quot;
                </p>
                <StarRating rating={featuredTestimonial.rating} />
                <p className="text-muted-foreground text-sm">
                  {featuredTestimonial.partnerBusiness} ·{" "}
                  {featuredTestimonial.partnerRegion}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="gap-4">
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <UsersIcon className="size-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold">
                  Jadilah Mitra Pertama Kami
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Cerita sukses para distributor HuCha Indonesia akan tampil di
                  sini. Daftarkan usaha Anda dan jadilah bagian dari cerita
                  pertama itu.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="#daftar">Daftar Sekarang</Link>
                </Button>
              </CardContent>
            </Card>
          )
        }
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Keuntungan"
            title="Mengapa Menjadi Distributor Kami?"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
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
            eyebrow="Proses"
            title="Cara Bergabung"
            description="Empat langkah sederhana untuk menjadi distributor HuCha Indonesia."
            align="center"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <Card key={item.step} className="gap-4">
                <CardHeader>
                  <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full font-bold">
                    {item.step}
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="daftar"
        className="scroll-mt-20 border-t bg-muted/40 py-16 sm:py-20"
      >
        <div className="container grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Daftar"
              title="Formulir Pendaftaran Distributor"
              description="Isi data di bawah ini. Tim sales kami akan menghubungi Anda dalam 1x24 jam kerja."
            />
            <ul className="space-y-2">
              {[
                "Minimal pembelian awal akan diinformasikan oleh tim sales.",
                "WhatsApp Anda hanya digunakan untuk proses kemitraan.",
                "Data Anda aman dan tidak dibagikan ke pihak ketiga.",
              ].map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-2 text-sm"
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
          <Card className="gap-0">
            <CardContent className="py-6">
              <DistributorForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Testimoni"
            title="Kata Distributor Kami"
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
          {testimonials.length === 0 ? (
            <EmptyState
              icon={<QuoteIcon aria-hidden="true" />}
              title="Belum ada testimoni"
              description="Cerita dari para distributor HuCha Indonesia akan segera hadir di sini."
            />
          ) : null}
        </div>
      </section>
    </>
  );
}

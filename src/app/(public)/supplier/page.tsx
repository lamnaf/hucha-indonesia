import Link from "next/link";
import { CheckCircle2Icon, HeadphonesIcon, PercentIcon, RocketIcon, UsersIcon } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { whatsappChatLink } from "@/lib/whatsapp-link";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { PartnerSlider } from "@/components/partner-slider";
import { SupplierForm } from "@/components/forms/supplier-form";

export const metadata = pageMetadata({
  title: "Kerjasama Supplier",
  description:
    "Jadilah supplier HUCHA Indonesia. Kami mencari mitra supplier bahan baku berkualitas untuk lini produk cairan otomotif dan perawatan kendaraan kami.",
  path: "/supplier",
});

const benefits = [
  {
    icon: PercentIcon,
    title: "Peluang Bisnis yang Berkembang",
    description:
      "Kesempatan untuk tumbuh bersama seiring perkembangan HUCHA dan pasar yang kami layani.",
  },
  {
    icon: RocketIcon,
    title: "Kolaborasi Pengembangan",
    description:
      "Terbuka untuk mengembangkan material, kemasan, dan solusi baru bersama supplier.",
  },
  {
    icon: HeadphonesIcon,
    title: "Procurement yang Terstruktur",
    description:
      "Proses pengadaan didukung komunikasi yang jelas dan tim procurement yang responsif.",
  },
  {
    icon: UsersIcon,
    title: "Kemitraan Jangka Panjang",
    description:
      "Membangun hubungan bisnis yang konsisten, saling mendukung, dan berkelanjutan.",
  },
];

const process = [
  {
    step: "1",
    title: "Daftar",
    description: "Isi formulir pendaftaran supplier dengan data perusahaan Anda.",
  },
  {
    step: "2",
    title: "Evaluasi",
    description:
      "Tim procurement mengevaluasi kemampuan produksi dan kualitas.",
  },
  {
    step: "3",
    title: "Audit & Kontrak",
    description: "Audit lapangan dan penandatanganan kerjasama.",
  },
  {
    step: "4",
    title: "Produksi",
    description: "Mulai pengiriman bahan baku sesuai jadwal produksi.",
  },
];

export default async function Supplier() {
  return (
    <>
      <Hero
        badge="Kerjasama Supplier"
        title="Menjadi Bagian dari Perjalanan HUCHA"
        description="Berkolaborasi, Bukan Sekadar Memasok."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#daftar">Menjadi Supplier HUCHA</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={whatsappChatLink(
                  "Halo HUCHA Indonesia, kami ingin bermitra sebagai supplier."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tanya via WhatsApp
              </a>
            </Button>
          </>
        }
        align="center"
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            title="Apa yang Kami Tawarkan"
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
            title="Cara Bergabung sebagai Supplier"
            description="Empat langkah untuk menjadi supplier HUCHA Indonesia."
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
              title="Menjadi Bagian dari Perjalanan HUCHA"
              description="Mari kenalkan perusahaan dan produk Anda kepada tim kami untuk menjajaki peluang kerja sama sebagai supplier."
            />
            <ul className="space-y-2">
              {[
                "Minimal spesifikasi produk akan dibahas saat evaluasi.",
                "WhatsApp/Email hanya digunakan untuk proses kerjasama.",
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
              <SupplierForm />
            </CardContent>
          </Card>
        </div>
      </section>

<section className="py-16 sm:py-20">
        <div className="container">
          <PartnerSlider />
        </div>
      </section>
    </>
  );
}
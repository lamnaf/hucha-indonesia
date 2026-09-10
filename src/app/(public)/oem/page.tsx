import Link from "next/link";
import {
  CheckCircle2Icon,
  FlaskConicalIcon,
  FactoryIcon,
  LayersIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { whatsappChatLink } from "@/lib/whatsapp-link";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { OemForm } from "@/components/forms/oem-form";

export const metadata = pageMetadata({
  title: "OEM & Maklon",
  description:
    "Kerja sama OEM/maklon private label bersama HuCha Indonesia untuk produk cairan otomotif dan perawatan kendaraan dengan formulasi sesuai kebutuhan Anda.",
  path: "/oem",
});

const capabilities = [
  {
    icon: FlaskConicalIcon,
    title: "Formulasi Khusus",
    description:
      "Tim riset dan pengembangan menyusun formulasi sesuai kebutuhan pasar dan segmen Anda.",
  },
  {
    icon: LayersIcon,
    title: "Kemasan Private Label",
    description:
      "Dukungan desain dan produksi kemasan dengan merek sendiri (private label).",
  },
  {
    icon: FactoryIcon,
    title: "Kapasitas Produksi",
    description:
      "Pabrik berkapasitas memadai untuk memenuhi kebutuhan produksi rutin maupun musiman.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Standar Mutu",
    description:
      "Setiap batch produksi melewati kontrol kualitas untuk memastikan konsistensi produk.",
  },
];

const process = [
  {
    step: "1",
    title: "Konsultasi",
    description:
      "Diskusikan kebutuhan produk, volume, dan spesifikasi dengan tim kami.",
  },
  {
    step: "2",
    title: "Penawaran & Contoh",
    description: "Kami mengajukan penawaran harga beserta contoh formulasi.",
  },
  {
    step: "3",
    title: "Produksi",
    description:
      "Setelah disetujui, produksi berjalan sesuai jadwal dengan kontrol mutu.",
  },
  {
    step: "4",
    title: "Pengiriman",
    description:
      "Produk dikirim ke gudang atau distributor Anda di seluruh Indonesia.",
  },
];

export default function Oem() {
  return (
    <>
      <Hero
        badge="OEM & Maklon"
        title="Wujudkan Produk Private Label Anda"
        description="HuCha Indonesia membuka kerja sama OEM/maklon untuk produk cairan otomotif dan perawatan kendaraan — dari formulasi hingga kemasan, sesuai kebutuhan bisnis Anda."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#inquiry">Kirim Inquiry</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={whatsappChatLink(
                  "Halo HuCha Indonesia, saya ingin membahas kerja sama OEM/maklon."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tanya via WhatsApp
              </a>
            </Button>
          </>
        }
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Kapabilitas"
            title="Apa yang Kami Tawarkan"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, description }) => (
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
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Kenapa OEM di HuCha?"
              title="Mitra Produksi yang Andal"
            />
            <ul className="space-y-3">
              {[
                "Berpengalaman di industri cairan otomotif dan perawatan kendaraan.",
                "Fleksibel untuk kebutuhan volume kecil hingga besar.",
                "Harga kompetitif dengan kualitas konsisten.",
                "Legalitas jelas — produksi di bawah badan usaha resmi.",
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
            <Button asChild variant="outline">
              <Link href="/kontak">Hubungi Tim Kami</Link>
            </Button>
          </div>
          <Card className="gap-0">
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
                  <WrenchIcon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Produk yang Bisa Dikerjakan
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Cairan otomotif & perawatan kendaraan
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Oli Mesin",
                  "Oli Sokbreker",
                  "Coolant",
                  "Shampo Motor",
                  "Coating / Pelindung",
                  "Perawatan Rantai",
                ].map((item) => (
                  <span
                    key={item}
                    className="bg-muted text-muted-foreground rounded-md px-3 py-1.5 text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                * Produk di luar daftar dapat didiskusikan dengan tim kami.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Proses"
            title="Alur Kerja Sama"
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

      <section id="inquiry" className="scroll-mt-20 py-16 sm:py-20">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Inquiry"
              title="Formulir Inquiry OEM"
              description="Ceritakan kebutuhan Anda, dan tim kami akan menyiapkan penawaran terbaik."
            />
            <ul className="space-y-2">
              {[
                "Isi minimal salah satu kontak (WhatsApp atau email).",
                "Pesan minimal 20 karakter agar kebutuhan Anda jelas.",
                "Respons kami dikirim dalam 1x24 jam kerja.",
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
              <OemForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

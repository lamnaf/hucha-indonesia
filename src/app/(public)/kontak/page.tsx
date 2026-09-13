import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/lib/public/site";
import { whatsappChatLink } from "@/lib/whatsapp-link";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = pageMetadata({
  title: "Kontak",
  description:
    "Hubungi HuCha Indonesia untuk pertanyaan produk, kemitraan distributor, layanan OEM, atau informasi lainnya. Kami siap membantu Anda.",
  path: "/kontak",
});

interface ContactItem {
  icon: LucideIcon;
  title: string;
  lines: string[];
  href?: string;
  cta?: string;
}

export default async function Contact() {
  const siteConfig = await getSiteConfig();

  const contactItems: ContactItem[] = [
    {
      icon: MapPinIcon,
      title: "Alamat",
      lines: [siteConfig.address],
      href: "https://maps.app.goo.gl/q7YuQGn786AQxDTQA?g_st=ac",
      cta: "Buka di Maps",
    },
    {
      icon: PhoneIcon,
      title: "WhatsApp / Telepon",
      lines: [siteConfig.phone],
      href: whatsappChatLink(),
      cta: "Chat Sekarang",
    },
    {
      icon: MailIcon,
      title: "Email",
      lines: [siteConfig.email],
      href: `mailto:${siteConfig.email}`,
      cta: "Kirim Email",
    },
    {
      icon: ClockIcon,
      title: "Jam Operasional",
      lines: [siteConfig.hours],
    },
  ];

  return (
    <>
      <Hero
        align="center"
        badge="Kontak"
        title="Mari Terhubung dengan Kami"
        description="Ada pertanyaan seputar produk, kemitraan, atau kerja sama OEM? Tim HuCha Indonesia siap membantu."
      />

      <section className="border-t bg-muted/40 py-12 sm:py-16">
        <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactItems.map(({ icon: Icon, title, lines, href, cta }) => (
            <Card key={title} className="gap-4">
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="text-base font-semibold">{title}</h2>
                <div className="space-y-0.5">
                  {lines.map((line) => (
                    <p
                      key={line}
                      className="text-muted-foreground text-sm break-all"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                {href ? (
                  <Button asChild variant="link" className="mt-auto w-fit p-0">
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {cta}
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Formulir"
              title="Kirim Pesan untuk Kami"
              description="Isi formulir di samping dan tim kami akan membalas melalui email dalam 1x24 jam kerja."
            />
            <Card className="gap-0">
              <CardContent className="py-6">
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SectionHeading
              eyebrow="Lokasi"
              title="Temukan Kami"
              description="Kunjungi kantor kami di Kota Pasuruan, Jawa Timur."
            />
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title={`Peta lokasi ${siteConfig.legalName}`}
                src={siteConfig.mapEmbedUrl}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

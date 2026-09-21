"use client";

import { useState } from "react";

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
    "Hubungi HuCha Indonesia untuk pertanyaan produk, kemitraan distributor, atau kerjasama lain. Tim kami akan merespons dalam 1x24 jam kerja.",
  path: "/kontak",
});

export default async function Contact() {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <Hero
        align="center"
        badge="Kontak"
        title="Mari Terhubung dengan Kami"
        description="Ada pertanyaan seputar produk, kemitraan, atau kerja sama? Isi formulir di bawah ini dan tim kami akan menghubungi Anda melalui email dalam 1x24 jam kerja."
      />

      <section className="border-t bg-muted/40 py-12 sm:py-16">
        <div className="container">
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
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Lokasi"
            title="Kontak Kami"
            description="Kami siap membahas kerjasama atau pertanyaan produk. Kirim pesan kami melalui formulir di atas."
          />
        </div>
      </section>
    </>
  );
}
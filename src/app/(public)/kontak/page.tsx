import { pageMetadata } from "@/lib/seo";

import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = pageMetadata({
  title: "Kontak",
  description:
    "Hubungi HuCha Indonesia untuk pertanyaan produk, kemitraan distributor, atau kerjasama lain. Tim kami akan merespons dalam 1x24 jam kerja.",
  path: "/kontak",
});

export default function Contact() {
  return (
    <>
      <Hero
        align="center"
        badge="Kontak"
        title="Mari Terhubung dengan Kami"
        description="Ada pertanyaan seputar produk, kemitraan, atau kerja sama? Isi formulir di bawah ini dan tim kami akan menghubungi Anda melalui email dalam 1x24 jam kerja."
      />

      <section className="border-t bg-muted/40 py-12 sm:py-16">
        <div className="container max-w-2xl">
          <SectionHeading
            title="Kirim Pesan untuk Kami"
            description="Isi formulir di bawah ini dan tim kami akan membalas melalui email dalam 1x24 jam kerja."
            align="center"
          />
          <Card className="gap-0 mt-6">
            <CardContent className="py-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

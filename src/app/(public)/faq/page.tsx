import Link from "next/link";
import { MessagesSquareIcon } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getFaqCategories } from "@/lib/public/faqs";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata = pageMetadata({
  title: "Pertanyaan yang Sering Diajukan",
  description:
    "Temukan jawaban atas pertanyaan seputar produk, kemitraan distributor, layanan OEM/maklon, dan informasi umum HuCha Indonesia.",
  path: "/faq",
});

export default async function Faq() {
  const faqCategories = await getFaqCategories();

  return (
    <>
      <Hero
        align="center"
        badge="FAQ"
        title="Pertanyaan yang Sering Diajukan"
        description="Jawaban singkat untuk pertanyaan yang paling sering kami terima dari pelanggan dan calon mitra."
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container grid gap-8 lg:grid-cols-2">
          {faqCategories.map((category) => (
            <Card key={category.slug} className="gap-0">
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <FaqAccordion items={category.questions} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container flex flex-col items-center gap-4 text-center">
          <MessagesSquareIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <h2 className="text-2xl">
            Tidak menemukan jawaban?
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Tim kami siap membantu menjawab pertanyaan Anda melalui WhatsApp
            atau email.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/kontak">Hubungi Kami</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/kemitraan">Info Kemitraan</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

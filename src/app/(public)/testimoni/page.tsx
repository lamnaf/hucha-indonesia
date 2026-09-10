import { QuoteIcon } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getPublicTestimonials } from "@/lib/public/testimonials";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import { SectionHeading } from "@/components/section-heading";
import { whatsappChatLink } from "@/lib/whatsapp-link";

export const metadata = pageMetadata({
  title: "Testimoni",
  description:
    "Cerita sukses para mitra bengkel, toko onderdil, dan distributor yang mempercayakan pertumbuhan usahanya pada HuCha Indonesia.",
  path: "/testimoni",
});

export default async function Testimonials() {
  const testimonials = await getPublicTestimonials();

  return (
    <>
      <Hero
        align="center"
        badge="Testimoni"
        title="Cerita Keberhasilan Mitra Kami"
        description="Kepercayaan dari bengkel dan toko onderdil di seluruh Indonesia adalah bukti terbaik kualitas produk dan layanan HuCha Indonesia."
        actions={
          <Button asChild size="lg">
            <a
              href={whatsappChatLink(
                "Halo HuCha Indonesia, saya ingin bertanya tentang produk dan kemitraan."
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi Tim Kami
            </a>
          </Button>
        }
      />

      <section className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Testimoni"
            title="Apa Kata Mereka"
            description="Kumpulan pengalaman mitra dan pelanggan HuCha Indonesia."
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
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
    </>
  );
}

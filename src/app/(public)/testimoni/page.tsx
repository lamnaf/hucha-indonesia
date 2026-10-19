import { pageMetadata } from "@/lib/seo";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { whatsappChatLink } from "@/lib/whatsapp-link";
import { PartnerSlider } from "@/components/partner-slider";

export const metadata = pageMetadata({
  title: "Partner Kami",
  description:
    "Tumbuh bersama HUCHA Indonesia. Jaringan mitra bengkel, toko onderdil, dan distributor di seluruh Indonesia.",
  path: "/testimoni",
});

export default async function Testimonials() {
  return (
    <>
      <Hero
        align="center"
        badge="Partner Kami"
        title="Tumbuh Bersama HUCHA"
        description="Kepercayaan dari mitra bengkel dan toko di seluruh Indonesia adalah bagian penting dari perjalanan kami."
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
          <PartnerSlider />
        </div>
      </section>
    </>
  );
}

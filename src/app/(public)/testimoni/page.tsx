import { pageMetadata } from "@/lib/seo";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { whatsappChatLink } from "@/lib/whatsapp-link";
import { PartnerSlider } from "@/components/partner-slider";

export const metadata = pageMetadata({
  title: "Testimoni",
  description:
    "Cerita sukses para mitra bengkel, toko onderdil, dan distributor yang mempercayakan pertumbuhan usahanya pada HuCha Indonesia.",
  path: "/testimoni",
});

export default async function Testimonials() {
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
          <PartnerSlider />
        </div>
      </section>
    </>
  );
}

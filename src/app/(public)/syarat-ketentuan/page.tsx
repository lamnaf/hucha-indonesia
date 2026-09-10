import { pageMetadata } from "@/lib/seo";
import { termsSections } from "@/lib/mock/legal";

import { Hero } from "@/components/hero";
import { LegalDocument } from "@/components/legal-document";

export const metadata = pageMetadata({
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan situs web HuCha Indonesia (CV Usaha Bintang Mulia).",
  path: "/syarat-ketentuan",
});

export default function Terms() {
  return (
    <>
      <Hero
        align="center"
        badge="Legal"
        title="Syarat & Ketentuan"
        description="Ketentuan yang mengatur penggunaan situs web dan layanan HuCha Indonesia."
      />
      <LegalDocument updatedAt="1 Januari 2026" sections={termsSections} />
    </>
  );
}

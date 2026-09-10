import { pageMetadata } from "@/lib/seo";
import { privacyPolicySections } from "@/lib/mock/legal";
import { getSiteConfig } from "@/lib/public/site";

import { Hero } from "@/components/hero";
import { LegalDocument } from "@/components/legal-document";

export const metadata = pageMetadata({
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi HuCha Indonesia (CV Usaha Bintang Mulia) tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda.",
  path: "/kebijakan-privasi",
});

export default async function PrivacyPolicy() {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <Hero
        align="center"
        badge="Legal"
        title="Kebijakan Privasi"
        description={`Bagaimana ${siteConfig.legalName} melindungi dan menggunakan data pribadi Anda.`}
      />
      <LegalDocument
        updatedAt="1 Januari 2026"
        sections={privacyPolicySections}
      />
    </>
  );
}

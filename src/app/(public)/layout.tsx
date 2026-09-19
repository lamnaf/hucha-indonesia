import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingSocial } from "@/components/floating-social";
import { JsonLd } from "@/components/json-ld";
import { getSiteConfig } from "@/lib/public/site";
import { siteUrl } from "@/lib/seo";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { AnalyticsConsent } from "@/components/analytics-consent";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteConfig = await getSiteConfig();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteUrl(),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressCountry: "ID",
    },
  };

  return (
    <>
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Lewati ke konten utama
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <FloatingSocial />
      <JsonLd data={organizationJsonLd} />
      <AnalyticsScripts
        googleAnalyticsId={siteConfig.analytics.googleAnalyticsId}
        googleTagManagerId={siteConfig.analytics.googleTagManagerId}
      />
      <AnalyticsConsent />
    </>
  );
}

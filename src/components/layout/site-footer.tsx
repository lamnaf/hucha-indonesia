import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/brand-logo";
import { SocialLinks } from "@/components/social-links";
import { getSiteConfig } from "@/lib/public/site";
import { footerColumns } from "@/lib/mock/site";

async function SiteFooter() {
  const siteConfig = await getSiteConfig();
  const marketplaceLinks = [
    {
      name: "Shopee",
      href: siteConfig.marketplaces.shopee,
      className: "bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white",
    },
    {
      name: "Tokopedia",
      href: siteConfig.marketplaces.tokopedia,
      className: "bg-[#03AC0E] hover:bg-[#03AC0E]/90 text-white",
    },
    {
      name: "TikTok Shop",
      href: siteConfig.marketplaces.tiktokShop,
      className: "bg-[#161823] hover:bg-[#161823]/90 text-white",
    },
  ].filter((marketplace) => marketplace.href);

  return (
    <Footer
      brand={<BrandLogo />}
      description={siteConfig.description}
      columns={footerColumns}
      bottom={
        <>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <SocialLinks showLabel />
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            {marketplaceLinks.length > 0 ? (
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-sm">
                <span>Belanja di marketplace resmi:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {marketplaceLinks.map((marketplace) => (
                    <Link
                      key={marketplace.name}
                      href={marketplace.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors ${marketplace.className}`}
                    >
                      <span>{marketplace.name}</span>
                      <ExternalLinkIcon className="size-3" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} {siteConfig.legalName}. Hak
              cipta dilindungi.
            </p>
          </div>
        </>
      }
    />
  );
}

export { SiteFooter };

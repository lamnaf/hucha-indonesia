import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/brand-logo";
import { SocialLinks } from "@/components/social-links";
import { getSiteConfig } from "@/lib/public/site";
import { footerColumns, marketplaces } from "@/lib/mock/site";

async function SiteFooter() {
  const siteConfig = await getSiteConfig();

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
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-sm">
              <span>Belanja di marketplace resmi:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {marketplaces.map((marketplace) => (
                  <Link
                    key={marketplace.name}
                    href={marketplace.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground rounded-md border px-2 py-1 text-xs transition-colors"
                  >
                    {marketplace.name}
                  </Link>
                ))}
              </div>
            </div>
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

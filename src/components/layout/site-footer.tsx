import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { BrandLogo } from "@/components/brand-logo";
import { SocialLinks } from "@/components/social-links";
import { getSiteConfig } from "@/lib/public/site";
import { footerColumns } from "@/lib/mock/site";

const marketplaceConfig = [
  {
    name: "Shopee",
    href: "https://id.shp.ee/pCoqqz4T",
    icon: "/shopee.png",
    className: "",
  },
  {
    name: "Tokopedia",
    href: "https://vt.tokopedia.com/t/ZS9DXMQPQ4KoT-Qz1UJ/",
    icon: "/tokopedia.png",
    className: "",
  },
  {
    name: "TikTok Shop",
    href: "https://www.tiktok.com/@hucha.indonesia",
    icon: "/tik-tok.png",
    className: "",
  },
];

async function SiteFooter() {
  const siteConfig = await getSiteConfig();
  const marketplaceLinks = [
    {
      name: "Shopee",
      href: siteConfig.marketplaces.shopee,
      icon: "/shopee.png",
      className: "bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white",
    },
    {
      name: "Tokopedia",
      href: siteConfig.marketplaces.tokopedia,
      icon: "/tokopedia.png",
      className: "bg-[#03AC0E] hover:bg-[#03AC0E]/90 text-white",
    },
    {
      name: "TikTok Shop",
      href: siteConfig.marketplaces.tiktokShop,
      icon: "/tik-tok.png",
      className: "bg-[#161823] hover:bg-[#161823]/90 text-white",
    },
  ]
    .map((marketplace) => ({
      ...marketplace,
      href: marketplace.href || marketplaceConfig.find((m) => m.name === marketplace.name)!.href,
    }))
    .filter((marketplace) => marketplace.href);

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
                {marketplaceLinks.map((marketplace) => (
                  <Link
                    key={marketplace.name}
                    href={marketplace.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={marketplace.name}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors ${marketplace.className}`}
                  >
                    {marketplace.name === "Shopee" ? (
                      <span className="flex size-4 items-center justify-center rounded-[4px] bg-white p-px">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={marketplace.icon}
                          alt={marketplace.name}
                          width={16}
                          height={16}
                          className="size-full object-contain"
                        />
                      </span>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={marketplace.icon}
                        alt={marketplace.name}
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                    )}
                    <span>{marketplace.name}</span>
                    <ExternalLinkIcon className="size-3" aria-hidden="true" />
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

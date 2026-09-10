import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface MarketplaceUrls {
  tokopediaUrl?: string;
  shopeeUrl?: string;
  tiktokshopUrl?: string;
}

const marketplaceButtons: {
  key: keyof MarketplaceUrls;
  label: string;
  className: string;
}[] = [
  {
    key: "tokopediaUrl",
    label: "Beli di Tokopedia",
    className: "bg-[#00aa5b] hover:bg-[#00aa5b]/90 text-white",
  },
  {
    key: "shopeeUrl",
    label: "Beli di Shopee",
    className: "bg-[#ee4d2d] hover:bg-[#ee4d2d]/90 text-white",
  },
  {
    key: "tiktokshopUrl",
    label: "Beli di TikTok Shop",
    className: "bg-[#161823] hover:bg-[#161823]/90 text-white",
  },
];

interface VisibleButton {
  key: keyof MarketplaceUrls;
  label: string;
  className: string;
  href: string;
}

export interface MarketplaceBadgesProps extends MarketplaceUrls {
  className?: string;
  align?: "left" | "center";
}

function MarketplaceBadges({
  tokopediaUrl,
  shopeeUrl,
  tiktokshopUrl,
  className,
  align = "left",
}: MarketplaceBadgesProps) {
  const urls = { tokopediaUrl, shopeeUrl, tiktokshopUrl };
  const visible: VisibleButton[] = marketplaceButtons.flatMap((button) => {
    const href = urls[button.key];
    return href ? [{ ...button, href }] : [];
  });

  if (visible.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        align === "center" && "justify-center",
        className
      )}
    >
      {visible.map((button) => (
        <Button
          key={button.key}
          asChild
          size="sm"
          className={cn("font-semibold", button.className)}
        >
          <Link href={button.href} target="_blank" rel="noopener noreferrer">
            {button.label}
            <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      ))}
    </div>
  );
}

export { MarketplaceBadges };

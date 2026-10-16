import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/mock/site";

export interface SocialLinkItem {
  label: string;
  href: string;
  icon: string; // Path to PNG image
}

export const socialLinkItems: SocialLinkItem[] = [
  {
    label: "WhatsApp",
    href: siteConfig.social.whatsapp,
    icon: "/whatsapp.png",
  },
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    icon: "/instagram.png",
  },
  {
    label: "TikTok",
    href: siteConfig.social.tiktok,
    icon: "/tik-tok.png",
  },
];

export interface SocialLinksProps {
  className?: string;
  showLabel?: boolean;
}

function SocialLinks({ className, showLabel = false }: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinkItems.map(({ label, href, icon: imgSrc }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            "text-muted-foreground inline-flex items-center gap-2 rounded-md text-sm",
            showLabel ? "px-2 py-1.5" : "size-9 justify-center"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={label}
            width={16}
            height={16}
            className="size-4 object-contain"
            aria-hidden="true"
          />
          {showLabel ? (
            <span>{label}</span>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export { SocialLinks };

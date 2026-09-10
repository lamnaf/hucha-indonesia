import Link from "next/link";
import {
  CameraIcon,
  MessageCircleIcon,
  Music2Icon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/mock/site";

export interface SocialLinkItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const socialLinkItems: SocialLinkItem[] = [
  {
    label: "WhatsApp",
    href: siteConfig.social.whatsapp,
    icon: MessageCircleIcon,
  },
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    icon: CameraIcon,
  },
  {
    label: "TikTok",
    href: siteConfig.social.tiktok,
    icon: Music2Icon,
  },
];

export interface SocialLinksProps {
  className?: string;
  showLabel?: boolean;
}

function SocialLinks({ className, showLabel = false }: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinkItems.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-md text-sm transition-colors",
            showLabel ? "px-2 py-1.5 hover:bg-accent" : "size-9 justify-center"
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
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

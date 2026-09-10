import { BikeIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/mock/site";

export interface BrandLogoProps {
  className?: string;
  markClassName?: string;
}

function BrandLogo({ className, markClassName }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg",
          markClassName
        )}
        aria-hidden="true"
      >
        <BikeIcon className="size-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-bold tracking-tight">
          {siteConfig.name}
        </span>
        <span className="text-muted-foreground text-xs">
          {siteConfig.tagline}
        </span>
      </span>
    </span>
  );
}

export { BrandLogo };

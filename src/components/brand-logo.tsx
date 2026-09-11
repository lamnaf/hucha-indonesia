import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  markClassName?: string;
}

function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="HuCha Logo"
        width={140}
        height={40}
        className="h-8 w-auto object-contain"
        priority
      />
    </span>
  );
}

export { BrandLogo };

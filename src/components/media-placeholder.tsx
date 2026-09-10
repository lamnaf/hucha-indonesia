import * as React from "react";

import { cn } from "@/lib/utils";

export interface MediaPlaceholderProps {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  aspect?: "video" | "square" | "auto";
}

/**
 * Gradient placeholder used in place of real photography until the media
 * library / storage backend is integrated. Keeps cards and heroes visually
 * consistent without shipping broken image references.
 */
function MediaPlaceholder({
  label,
  icon,
  aspect = "video",
  className,
}: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground relative flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-muted via-accent to-secondary",
        aspect === "video" && "aspect-video",
        aspect === "square" && "aspect-square",
        aspect === "auto" && "aspect-auto",
        className
      )}
    >
      {icon ? (
        <div className="text-muted-foreground flex items-center gap-2 [&_svg]:size-10 [&_svg]:opacity-50">
          {icon}
        </div>
      ) : null}
      {label ? (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2 text-xs font-semibold text-white">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export { MediaPlaceholder };

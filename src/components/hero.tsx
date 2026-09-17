import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface HeroProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  visual?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

/**
 * Reusable marketing hero section. Content on one side, optional `visual`
 * on the other. Use `align="center"` for a stacked, centered layout.
 */
function Hero({
  badge,
  title,
  description,
  actions,
  visual,
  align = "left",
  className,
  titleClassName,
}: HeroProps) {
  const centered = align === "center";

  const content = (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered && "mx-auto max-w-2xl items-center text-center"
      )}
    >
      {badge ? <Badge variant="outline">{badge}</Badge> : null}
      <h1 className={cn("text-balance text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider font-heading leading-none", titleClassName)}>
        {title}
      </h1>
      {description ? (
        <p className="text-muted-foreground text-pretty text-lg font-sans">
          {description}
        </p>
      ) : null}
      {actions ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3",
            centered && "justify-center"
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );

  return (
    <section data-slot="hero" className={cn("py-16 sm:py-24", className)}>
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        {visual ? (
          <>
            {content}
            <div className="relative">{visual}</div>
          </>
        ) : (
          <div className="col-span-full">{content}</div>
        )}
      </div>
    </section>
  );
}

export { Hero };

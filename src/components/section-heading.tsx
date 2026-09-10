import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  link?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3",
        centered && "items-center text-center",
        link ? "sm:flex-row sm:items-end sm:justify-between" : "sm:flex-col",
        className
      )}
    >
      <div className={cn("space-y-2", centered && "max-w-2xl")}>
        {eyebrow ? (
          <p className="text-primary text-sm font-semibold uppercase tracking-wider">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "text-muted-foreground text-pretty text-base",
              centered && "mx-auto"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1 text-sm font-medium"
        >
          {link.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export { SectionHeading };

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  brand: React.ReactNode;
  description?: React.ReactNode;
  columns?: FooterColumn[];
  bottom?: React.ReactNode;
  className?: string;
}

/**
 * Reusable site footer with brand, description, and link columns. `bottom`
 * is rendered in the lower bar (e.g. copyright / legal links).
 */
function Footer({
  brand,
  description,
  columns = [],
  bottom,
  className,
}: FooterProps) {
  return (
    <footer
      data-slot="footer"
      className={cn("border-t bg-background", className)}
    >
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="space-y-3 lg:col-span-1">
          <div>{brand}</div>
          {description ? (
            <p className="text-muted-foreground max-w-xs text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {bottom ? (
        <div className="border-t">
          <div className="container flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
            {bottom}
          </div>
        </div>
      ) : null}
    </footer>
  );
}

export { Footer };

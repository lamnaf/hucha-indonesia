import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/seo";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Reusable breadcrumb navigation (blueprint §35/§17). Renders a visible,
 * keyboard-accessible breadcrumb trail plus a matching `BreadcrumbList`
 * schema.org JSON-LD block for search engines. `items` must not include the
 * home page — it is prepended automatically.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Beranda", href: "/" }, ...items];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Jejak navigasi">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 ? (
                <ChevronRightIcon
                  className="text-muted-foreground/50 size-3.5"
                  aria-hidden="true"
                />
              ) : null}
              {isLast || !item.href ? (
                <span
                  className="text-muted-foreground font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <HomeIcon className="size-3.5" aria-hidden="true" />
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd} />
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { Navbar, type NavbarLink } from "@/components/layout/navbar";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { primaryNav, siteConfig } from "@/lib/mock/site";

function isActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildLinks(pathname: string): NavbarLink[] {
  return primaryNav.map((link) => {
    const active = isActive(link.href, pathname);
    if (!link.children) {
      return { label: link.label, href: link.href, active };
    }
    return {
      label: link.label,
      href: link.href,
      active,
      children: link.children.map((child) => ({
        label: child.label,
        href: child.href,
      })),
    };
  });
}

/**
 * Public site header: brand + primary navigation wired to the current route
 * so the active link stays highlighted across pages.
 */
function SiteHeader() {
  const pathname = usePathname();

  return (
    <Navbar
      brand={<BrandLogo />}
      links={buildLinks(pathname)}
      actions={
        <>
          <Button
            asChild
            size="sm"
            className="bg-white font-semibold uppercase tracking-wide text-navy-dark shadow-sm hover:bg-white/85 hover:text-navy-dark"
          >
            <a
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              HUBUNGI KAMI
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="distributor-cta hidden font-semibold uppercase tracking-wide border-white/50 bg-transparent text-white shadow-none hover:border-white hover:bg-white hover:text-navy-dark max-md:flex max-md:w-full lg:inline-flex"
          >
            <Link href="/kemitraan">MENJADI DISTRIBUTOR</Link>
          </Button>
        </>
      }
    />
  );
}

export { SiteHeader };

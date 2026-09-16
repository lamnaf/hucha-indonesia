"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NavbarLink {
  label: string;
  href: string;
  active?: boolean;
  children?: NavbarLink[];
}

export interface NavbarProps {
  brand: React.ReactNode;
  links?: NavbarLink[];
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Reusable site navbar with a responsive mobile menu and optional dropdown
 * links (rendered when a nav item has `children`). Sticky, border-bottom
 * styled. Pass `brand`, `links`, and optional `actions`.
 */
function Navbar({ brand, links = [], actions, className }: NavbarProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      data-slot="navbar"
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-navy-dark/95 backdrop-blur supports-[backdrop-filter]:bg-navy-dark/80",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={() => setOpen(false)}>
            {brand}
          </Link>
          {links.length > 0 ? (
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) =>
                link.children?.length ? (
                  <DropdownNavLink key={link.href} link={link} />
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={link.active ?? false}
                    className={cn(
                      "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                      link.active
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {actions ? (
            <div className="hidden items-center gap-2 md:flex">{actions}</div>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="navbar-mobile-menu"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          id="navbar-mobile-menu"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t p-4 md:hidden"
        >
          {links.length > 0 ? (
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    data-active={link.active ?? false}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      link.active
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.children?.length ? (
                    <div className="ml-3 flex flex-col gap-1 border-l pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </nav>
          ) : null}
          {actions ? (
            <div className="mt-4 flex flex-col gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function DropdownNavLink({ link }: { link: NavbarLink }) {
  return (
    <div className="group relative">
      <Link
        href={link.href}
        data-active={link.active ?? false}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
          link.active
            ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        {link.label}
        <ChevronDownIcon className="size-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
      </Link>
      <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
        <div
          role="menu"
          className="bg-navy-dark text-white min-w-56 rounded-xl border border-white/10 p-1.5 shadow-xl backdrop-blur-xl"
        >
          {link.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              className="hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white block rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors outline-hidden"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Navbar };

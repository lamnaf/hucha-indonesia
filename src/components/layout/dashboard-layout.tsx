"use client";

import * as React from "react";
import { MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DrawerRoot, DrawerContent } from "@/components/ui/drawer";
import { Sidebar, type SidebarItem } from "@/components/layout/sidebar";

export interface DashboardLayoutProps {
  items: SidebarItem[];
  brand?: React.ReactNode;
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable dashboard shell: fixed sidebar on desktop, slide-over drawer
 * (focus-trapped, Escape/overlay closable) on mobile, and a top header bar.
 * Pure presentational.
 */
function DashboardLayout({
  items,
  brand,
  header,
  headerActions,
  sidebarFooter,
  children,
  className,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div
      data-slot="dashboard-layout"
      className={cn("flex min-h-dvh w-full", className)}
    >
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Lewati ke konten utama
      </a>
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar items={items} brand={brand} footer={sidebarFooter} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Buka menu"
              aria-expanded={mobileOpen}
              aria-controls="dashboard-mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </Button>
            {header}
          </div>
          {headerActions ? (
            <div className="flex items-center gap-2">{headerActions}</div>
          ) : null}
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>

      <DrawerRoot open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent
          id="dashboard-mobile-menu"
          side="left"
          showCloseButton
          className="max-w-72"
        >
          <Sidebar items={items} brand={brand} footer={sidebarFooter} />
        </DrawerContent>
      </DrawerRoot>
    </div>
  );
}

export { DashboardLayout };

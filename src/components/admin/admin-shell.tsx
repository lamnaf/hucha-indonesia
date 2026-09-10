"use client";

import { usePathname } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { SidebarItem } from "@/components/layout/sidebar";

export interface AdminShellProps {
  items: SidebarItem[];
  brand?: React.ReactNode;
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  children?: React.ReactNode;
}

function markActive(items: SidebarItem[], pathname: string): SidebarItem[] {
  return items.map((item) => {
    const children = item.children
      ? markActive(item.children, pathname)
      : undefined;
    const active = item.href !== undefined && pathname.startsWith(item.href);
    return { ...item, active, children };
  });
}

/**
 * Client wrapper around the shared `DashboardLayout` for the admin area:
 * derives the active sidebar item from the current path and renders the
 * fixed sidebar (desktop) + drawer (mobile) + top bar.
 */
function AdminShell({
  items,
  brand,
  header,
  headerActions,
  sidebarFooter,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const activeItems = markActive(items, pathname);

  return (
    <DashboardLayout
      items={activeItems}
      brand={brand}
      header={header}
      headerActions={headerActions}
      sidebarFooter={sidebarFooter}
    >
      {children}
    </DashboardLayout>
  );
}

export { AdminShell };

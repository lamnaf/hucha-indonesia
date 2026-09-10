"use client";

import { Collapsible } from "radix-ui";
import * as React from "react";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function SidebarLink({
  item,
  onClick,
}: {
  item: SidebarItem;
  onClick?: () => void;
}) {
  const icon = item.icon ? (
    <span className="text-muted-foreground shrink-0 [&_svg]:size-4 [&_svg]:shrink-0">
      {item.icon}
    </span>
  ) : null;

  if (item.disabled) {
    return (
      <span
        data-slot="sidebar-label"
        data-disabled="true"
        aria-disabled="true"
        title="Modul akan tersedia pada fase berikutnya"
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground",
          "cursor-not-allowed"
        )}
      >
        {icon}
        {item.label}
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Segera
        </span>
      </span>
    );
  }

  if (!item.href) {
    return (
      <span
        data-slot="sidebar-label"
        data-active={item.active ?? false}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
          item.active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground"
        )}
      >
        {icon}
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      data-slot="sidebar-link"
      data-active={item.active ?? false}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        item.active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      {item.label}
    </Link>
  );
}

function SidebarGroup({ item }: { item: SidebarItem }) {
  const [open, setOpen] = React.useState(item.active ?? false);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      data-slot="sidebar-group"
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            item.active
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          aria-expanded={open}
        >
          <span className="flex items-center gap-3">
            {item.icon ? (
              <span className="text-muted-foreground shrink-0 [&_svg]:size-4 [&_svg]:shrink-0">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </span>
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-3">
          {item.children?.map((child) =>
            child.children ? (
              <SidebarGroup key={child.id} item={child} />
            ) : (
              <SidebarLink key={child.id} item={child} />
            )
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

/**
 * Reusable sidebar for dashboards. Supports flat links and collapsible
 * nested groups. Pure presentational — pass `items` with `active`/`href` set
 * by the caller.
 */
function Sidebar({ items, brand, footer, className }: SidebarProps) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "flex h-full w-full flex-col border-r bg-background",
        className
      )}
    >
      {brand ? (
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          {brand}
        </div>
      ) : null}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) =>
          item.children ? (
            <SidebarGroup key={item.id} item={item} />
          ) : (
            <SidebarLink key={item.id} item={item} />
          )
        )}
      </nav>
      {footer ? <div className="shrink-0 border-t p-3">{footer}</div> : null}
    </aside>
  );
}

export { Sidebar };

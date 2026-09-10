"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  BellIcon,
  ChevronDownIcon,
  CircleUserRoundIcon,
  LogOutIcon,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { logoutAction } from "@/domain/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminHeaderProps {
  userName: string;
  userEmail: string;
  adminLabel: string;
  unreadCount: number;
}

/**
 * Admin top navigation (blueprint §10/§29): notification bell with unread
 * badge and a user menu (profile link + logout). Rendered in the dashboard
 * header's right slot.
 */
function AdminHeader({
  userName,
  userEmail,
  adminLabel,
  unreadCount,
}: AdminHeaderProps) {
  const [isLoggingOut, startLogoutTransition] = useTransition();

  return (
    <>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={
          unreadCount > 0
            ? `Notifikasi, ${unreadCount} belum dibaca`
            : "Notifikasi"
        }
      >
        <Link href="/admin/notifications">
          <BellIcon aria-hidden="true" />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="bg-destructive text-white absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-semibold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="hover:bg-accent focus-visible:ring-ring/50 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium outline-none focus-visible:ring-[3px]"
            aria-label="Menu pengguna"
          >
            <span className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full">
              <CircleUserRoundIcon className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block">{userName}</span>
              <span className="text-muted-foreground block text-xs">
                {adminLabel}
              </span>
            </span>
            <ChevronDownIcon
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="bg-popover text-popover-foreground min-w-56 rounded-md border p-1 shadow-md"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-muted-foreground text-xs">{userEmail}</p>
            </div>
            <DropdownMenu.Separator className="bg-border -mx-1 my-1 h-px" />
            <DropdownMenu.Item asChild>
              <Link
                href="/admin/profil"
                className="focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-sm px-3 py-2 text-sm outline-hidden"
              >
                <CircleUserRoundIcon className="size-4" aria-hidden="true" />
                Profil Saya
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="bg-border -mx-1 my-1 h-px" />
            <DropdownMenu.Item
              disabled={isLoggingOut}
              onSelect={(event) => {
                event.preventDefault();
                startLogoutTransition(async () => {
                  await logoutAction();
                });
              }}
              className={cn(
                "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                "flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm outline-hidden"
              )}
            >
              <LogOutIcon className="size-4" aria-hidden="true" />
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
}

export { AdminHeader };

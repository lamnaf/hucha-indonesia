import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/domain/auth/session";
import { NotificationRepository } from "@/domain/users/notification.repository";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { buildAdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin area layout. When a valid session exists the signed-in user gets
 * the dashboard shell (sidebar + top nav); otherwise (e.g. `/admin/login`)
 * the children render in a plain, unauthenticated frame.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (!user) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  const unreadCount = await new NotificationRepository().unreadCount(user.id);

import Image from "next/image";

const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <Image src="/logo.png" alt="HuCha Logo" width={100} height={28} className="h-7 w-auto object-contain" />
      <span className="text-sm leading-tight font-semibold">
        HuCha Admin
        <span className="text-muted-foreground block text-xs font-normal">
          Panel Manajemen
        </span>
      </span>
    </Link>
);

  const sidebarFooter = (
    <div className="flex items-center gap-3">
      <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">Super Admin</p>
      </div>
    </div>
  );

  return (
    <AdminShell
      items={buildAdminNav()}
      brand={brand}
      header={<span className="font-semibold lg:hidden">HuCha Admin</span>}
      headerActions={
        <AdminHeader
          userName={user.name}
          userEmail={user.email}
          adminLabel="Super Admin"
          unreadCount={unreadCount}
        />
      }
      sidebarFooter={sidebarFooter}
    >
      {children}
    </AdminShell>
  );
}

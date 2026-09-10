import type { Metadata } from "next";
import { BellIcon, CheckIcon } from "lucide-react";

import { requirePageAuth } from "@/domain/auth/guards";
import { NotificationRepository } from "@/domain/users/notification.repository";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/domain/users/notification-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { formatRelativeTime } from "@/lib/admin";
import type { NotificationType } from "@/infrastructure/database/generated/client";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifikasi",
  robots: { index: false, follow: false },
};

const TYPE_LABELS: Record<NotificationType, string> = {
  lead: "Lead",
  application: "Lamaran",
  system: "Sistem",
};

const PAGE_SIZE = 20;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requirePageAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, unread } =
    await new NotificationRepository().listForUser(user.id, {
      page,
      pageSize: PAGE_SIZE,
    });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = nextPage > 1 ? `?page=${nextPage}` : "";
    return `/admin/notifications${query}`;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifikasi</h1>
          <p className="text-muted-foreground text-sm">
            {unread > 0
              ? `${unread} notifikasi belum dibaca`
              : "Semua notifikasi telah dibaca"}
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm">
              <CheckIcon className="size-4" aria-hidden="true" />
              Tandai Semua Dibaca
            </Button>
          </form>
        ) : null}
      </div>

      <Card>
        {items.length > 0 ? (
          <ul className="divide-y">
            {items.map((notification) => (
              <li
                key={notification.id}
                className={cn(
                  "flex items-start justify-between gap-4 px-6 py-4",
                  !notification.isRead && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      notification.isRead
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <BellIcon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {notification.title}
                      </p>
                      <Badge variant="secondary">
                        {TYPE_LABELS[notification.type]}
                      </Badge>
                      {!notification.isRead ? (
                        <span
                          className="bg-primary size-2 rounded-full"
                          aria-label="Belum dibaca"
                        />
                      ) : null}
                    </div>
                    {notification.body ? (
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        {notification.body}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
                {!notification.isRead ? (
                  <form
                    action={markNotificationReadAction.bind(
                      null,
                      notification.id
                    )}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      aria-label="Tandai dibaca"
                    >
                      <CheckIcon className="size-4" aria-hidden="true" />
                      <span className="sr-only">Tandai dibaca</span>
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<BellIcon aria-hidden="true" />}
            title="Tidak ada notifikasi"
            description="Notifikasi lead baru, lamaran, dan pengumuman sistem akan muncul di sini."
          />
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} notifikasi
        </p>
        <PaginationNav
          prevHref={pageHref(page - 1)}
          nextHref={pageHref(page + 1)}
          prevDisabled={page <= 1}
          nextDisabled={page >= totalPages}
        />
      </div>
    </div>
  );
}

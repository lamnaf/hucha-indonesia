import type { Metadata } from "next";
import { MailIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { NewsletterSubscriberRepository } from "@/domain/newsletter/newsletter.repository";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateTime } from "@/lib/admin";
import { SubscriberRowActions } from "./subscriber-actions";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const subscribed =
    params.status === "subscribed"
      ? true
      : params.status === "unsubscribed"
        ? false
        : undefined;

  const { items, total } = await new NewsletterSubscriberRepository().listAdmin(
    {
      page,
      pageSize: PAGE_SIZE,
      search,
      subscribed,
    }
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (subscribed !== undefined)
      query.set("status", subscribed ? "subscribed" : "unsubscribed");
    const qs = query.toString();
    return `/admin/newsletter${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        description="Daftar pelanggan newsletter dari formulir publik."
      />

      <form
        method="get"
        action="/admin/newsletter"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari email atau nama..."
          className="max-w-xs"
          aria-label="Cari pelanggan"
        />
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Status
          </span>
          <select
            name="status"
            defaultValue={
              subscribed === undefined
                ? ""
                : subscribed
                  ? "subscribed"
                  : "unsubscribed"
            }
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            <option value="subscribed">Berlangganan</option>
            <option value="unsubscribed">Berhenti</option>
          </select>
        </label>
        <Button type="submit" size="sm">
          Terapkan
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card">
        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Sumber</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Terdaftar</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((subscriber) => (
                <tr key={subscriber.id} className="border-b last:border-0">
                  <td className="break-all px-4 py-3 font-medium">
                    {subscriber.email}
                  </td>
                  <td className="px-4 py-3">{subscriber.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {subscriber.source ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        subscriber.isSubscribed ? "default" : "secondary"
                      }
                    >
                      {subscriber.isSubscribed ? "Berlangganan" : "Berhenti"}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {formatDateTime(subscriber.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SubscriberRowActions
                      subscriberId={subscriber.id}
                      email={subscriber.email}
                      isSubscribed={subscriber.isSubscribed}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<MailIcon aria-hidden="true" />}
            title="Belum ada pelanggan"
            description="Pelanggan yang mendaftar melalui formulir newsletter akan tampil di sini."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} pelanggan
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

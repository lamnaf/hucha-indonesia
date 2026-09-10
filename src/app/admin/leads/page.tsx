import type { Metadata } from "next";
import Link from "next/link";
import { InboxIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { LeadRepository } from "@/domain/leads/lead.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateTime } from "@/lib/admin";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/admin";
import type {
  LeadStatus,
  LeadType,
} from "@/infrastructure/database/generated/client";
import { LeadRowActions } from "./lead-actions";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;
const LEAD_TYPES: LeadType[] = ["distributor", "oem", "contact"];
const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "converted",
  "rejected",
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    type?: string;
    status?: string;
    search?: string;
    archived?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const type = LEAD_TYPES.includes(params.type as LeadType)
    ? (params.type as LeadType)
    : undefined;
  const status = LEAD_STATUSES.includes(params.status as LeadStatus)
    ? (params.status as LeadStatus)
    : undefined;
  const search = params.search?.trim() || undefined;
  const archived = params.archived === "1";

  const { items, total } = await new LeadRepository().list({
    page,
    pageSize: PAGE_SIZE,
    type,
    status,
    search,
    archived,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(
    nextPage: number,
    nextType?: LeadType | string,
    nextArchived?: boolean
  ): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (nextType) query.set("type", nextType);
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    if (nextArchived ?? archived) query.set("archived", "1");
    const qs = query.toString();
    return `/admin/leads${qs ? `?${qs}` : ""}`;
  }

  const exportQuery = new URLSearchParams();
  if (type) exportQuery.set("type", type);
  if (status) exportQuery.set("status", status);
  if (search) exportQuery.set("search", search);
  if (archived) exportQuery.set("archived", "1");
  const exportHref = `/api/admin/leads/export?${exportQuery.toString()}`;
  const exportXlsHref = `/api/admin/leads/export-xls?${exportQuery.toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Permintaan distributor, OEM, dan kontak masuk dari situs."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={exportXlsHref}>Export Excel</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={exportHref}>Export CSV</Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        <Link
          href={buildHref(1, undefined, false)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            !type && !archived ? "bg-navy text-white" : "hover:bg-accent"
          }`}
        >
          Semua
        </Link>
        {LEAD_TYPES.map((leadType) => (
          <Link
            key={leadType}
            href={buildHref(1, leadType, false)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              type === leadType
                ? "bg-navy text-white"
                : "hover:bg-accent"
            }`}
          >
            {LEAD_TYPE_LABELS[leadType]}
          </Link>
        ))}
        <Link
          href={buildHref(1, undefined, true)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            archived ? "bg-navy text-white" : "hover:bg-accent"
          }`}
        >
          Arsip
        </Link>
      </div>

      <form
        method="get"
        action="/admin/leads"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari nama, perusahaan, email..."
          className="max-w-xs"
          aria-label="Cari lead"
        />
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Status
          </span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            {LEAD_STATUSES.map((leadStatus) => (
              <option key={leadStatus} value={leadStatus}>
                {LEAD_STATUS_LABELS[leadStatus]}
              </option>
            ))}
          </select>
        </label>
        {type ? <input type="hidden" name="type" value={type} /> : null}
        {archived ? <input type="hidden" name="archived" value="1" /> : null}
        <Button type="submit" size="sm">
          Terapkan
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card">
        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium">Kontak</th>
                <th className="px-4 py-3 font-medium">Perusahaan / Wilayah</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Diterima</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!lead.isRead ? (
                        <span
                          className="bg-primary size-2 shrink-0 rounded-full"
                          title="Belum dibaca"
                          aria-label="Lead belum dibaca"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-medium">{lead.fullName}</p>
                        <p className="text-muted-foreground break-all text-xs">
                          {lead.email ?? lead.whatsapp ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="break-words">
                      {lead.companyName ?? lead.region ?? "—"}
                    </p>
                    {lead.categoryOfInterest ? (
                      <p className="text-muted-foreground text-xs">
                        {lead.categoryOfInterest}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {LEAD_TYPE_LABELS[lead.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={lead.status === "new" ? "default" : "secondary"}
                    >
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {formatDateTime(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/leads/${lead.id}`}>Detail</Link>
                      </Button>
                      <LeadRowActions
                        leadId={lead.id}
                        name={lead.fullName}
                        archived={lead.archived}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<InboxIcon aria-hidden="true" />}
            title={archived ? "Arsip kosong" : "Belum ada lead"}
            description={
              archived
                ? "Lead yang diarsipkan akan tampil di sini."
                : "Permintaan masuk dari halaman Mitra, OEM, dan Kontak akan tampil di sini."
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} lead
        </p>
        <PaginationNav
          prevHref={buildHref(page - 1, type, archived)}
          nextHref={buildHref(page + 1, type, archived)}
          prevDisabled={page <= 1}
          nextDisabled={page >= totalPages}
        />
      </div>
    </div>
  );
}

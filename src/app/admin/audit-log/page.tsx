import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/domain/auth/guards";
import { AuditLogRepository } from "@/domain/audit/audit-log.repository";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { auditActionLabel, entityLabel, formatDateTime } from "@/lib/admin";
import type { AuditAction } from "@/infrastructure/database/generated/client";

export const metadata: Metadata = {
  title: "Log Aktivitas",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

const ACTIONS: AuditAction[] = [
  "create",
  "update",
  "delete",
  "publish",
  "login",
];

interface AuditPageSearchParams {
  page?: string;
  action?: string;
  entity?: string;
}

function metaSummary(meta: unknown): string {
  if (!meta || typeof meta !== "object") {
    return "";
  }
  return Object.entries(meta as Record<string, unknown>)
    .slice(0, 2)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" · ");
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<AuditPageSearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const action = ACTIONS.includes(params.action as AuditAction)
    ? (params.action as AuditAction)
    : undefined;
  const entity = params.entity?.trim() || undefined;

  const { items, total } = await new AuditLogRepository().list({
    page,
    pageSize: PAGE_SIZE,
    ...(action ? { action } : {}),
    ...(entity ? { entityType: entity } : {}),
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const search = new URLSearchParams();
    if (nextPage > 1) search.set("page", String(nextPage));
    if (action) search.set("action", action);
    if (entity) search.set("entity", entity);
    const qs = search.toString();
    return `/admin/audit-log${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log Aktivitas</h1>
        <p className="text-muted-foreground text-sm">
          Riwayat append-only dari semua aksi admin (§32). Hanya dapat dilihat,
          tidak dapat diubah atau dihapus.
        </p>
      </div>

      <form
        method="get"
        action="/admin/audit-log"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="space-y-1.5">
          <label htmlFor="filter-action" className="text-sm font-medium">
            Aksi
          </label>
          <select
            id="filter-action"
            name="action"
            defaultValue={action ?? "all"}
            className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-48 items-center gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
          >
            <option value="all">Semua aksi</option>
            {ACTIONS.map((value) => (
              <option key={value} value={value}>
                {auditActionLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="filter-entity" className="text-sm font-medium">
            Jenis Entitas
          </label>
          <Input
            id="filter-entity"
            name="entity"
            defaultValue={entity ?? ""}
            placeholder="Contoh: product, user, setting"
            className="w-56"
          />
        </div>
        <Button type="submit" size="sm">
          Terapkan Filter
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/audit-log">Reset</Link>
        </Button>
      </form>

      <div className="rounded-xl border bg-card">
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead className="text-right">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {auditActionLabel(entry.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entityLabel(entry.entityType)}
                    {entry.entityId ? ` #${entry.entityId}` : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-64 truncate">
                    {metaSummary(entry.meta)}
                  </TableCell>
                  <TableCell>{entry.user?.name ?? "Sistem"}</TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Belum ada catatan"
            description="Tidak ada log aktivitas yang cocok dengan filter Anda."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} catatan
        </p>
        <div className="flex gap-2">
          <PaginationNav
            prevHref={pageHref(page - 1)}
            nextHref={pageHref(page + 1)}
            prevDisabled={page <= 1}
            nextDisabled={page >= totalPages}
          />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SearchCheckIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { SeoMetaRepository } from "@/domain/seo/seo-meta.repository";
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
import { EmptyState } from "@/components/empty-state";
import { entityLabel } from "@/lib/admin";

export const metadata: Metadata = {
  title: "SEO Manager",
  robots: { index: false, follow: false },
};

interface SeoAuditSearchParams {
  entity?: string;
  status?: string;
}

const ENTITY_OPTIONS = ["product", "article"] as const;
type AuditEntity = (typeof ENTITY_OPTIONS)[number];

const STATUS_OPTIONS = ["ok", "issue"] as const;
type AuditStatus = (typeof STATUS_OPTIONS)[number];

function isAuditEntity(value: string | undefined): value is AuditEntity {
  return ENTITY_OPTIONS.some((option) => option === value);
}

function isAuditStatus(value: string | undefined): value is AuditStatus {
  return STATUS_OPTIONS.some((option) => option === value);
}

const ISSUE_LABELS: Record<string, string> = {
  "missing meta_title": "Meta title belum diisi",
  "meta_title too long": "Meta title terlalu panjang (>60)",
  "missing meta_description": "Meta description belum diisi",
  "meta_description too long": "Meta description terlalu panjang (>155)",
  "missing og image": "Gambar Open Graph belum diisi",
  "missing og_title": "OG title belum diisi",
  "missing og_description": "OG description belum diisi",
  "missing keywords": "Keywords belum diisi",
};

function issueLabel(issue: string): string {
  return ISSUE_LABELS[issue] ?? issue;
}

export default async function SeoManagerPage({
  searchParams,
}: {
  searchParams: Promise<SeoAuditSearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const entity = isAuditEntity(params.entity) ? params.entity : undefined;
  const status = isAuditStatus(params.status) ? params.status : undefined;

  const audit = await new SeoMetaRepository().listAuditCandidates();

  const filtered = audit.filter((item) => {
    if (entity && item.entityType !== entity) return false;
    if (status === "ok" && item.issues.length > 0) return false;
    if (status === "issue" && item.issues.length === 0) return false;
    return true;
  });

  const total = audit.length;
  const missingTitle = audit.filter((item) =>
    item.issues.includes("missing meta_title")
  ).length;
  const missingDescription = audit.filter((item) =>
    item.issues.includes("missing meta_description")
  ).length;
  const okCount = audit.filter((item) => item.issues.length === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SEO Manager</h1>
        <p className="text-muted-foreground text-sm">
          Audit metadata SEO untuk semua produk dan artikel terbit (blueprint
          §27). Item yang bermasalah ditandai, tidak diblokir — edit langsung
          dari form produk/artikel terkait.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium">
            Total Entitas Terbit
          </p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium">
            Meta Title Belum Diisi
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {missingTitle}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium">
            Meta Description Belum Diisi
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {missingDescription}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium">Sempurna</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {okCount}
          </p>
        </div>
      </div>

      <form
        method="get"
        action="/admin/seo"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="space-y-1.5">
          <label htmlFor="filter-entity" className="text-sm font-medium">
            Jenis Entitas
          </label>
          <select
            id="filter-entity"
            name="entity"
            defaultValue={entity ?? "all"}
            className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-48 items-center gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
          >
            <option value="all">Semua entitas</option>
            {ENTITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {entityLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="filter-status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={status ?? "all"}
            className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-48 items-center gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
          >
            <option value="all">Semua status</option>
            <option value="issue">Ada masalah</option>
            <option value="ok">Sempurna</option>
          </select>
        </div>
        <Button type="submit" size="sm">
          Terapkan Filter
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/seo">Reset</Link>
        </Button>
      </form>

      <div className="rounded-xl border bg-card">
        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entitas</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status SEO</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isProduct = item.entityType === "product";
                const editHref = isProduct
                  ? `/admin/products/${item.entityId}`
                  : `/admin/blog/${item.entityId}`;
                const ok = item.issues.length === 0;
                return (
                  <TableRow key={`${item.entityType}-${item.entityId}`}>
                    <TableCell>
                      <Badge variant="outline">
                        {entityLabel(item.entityType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-64 truncate font-medium">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        /{item.slug}
                      </p>
                    </TableCell>
                    <TableCell>
                      {ok ? (
                        <Badge variant="secondary">Sempurna</Badge>
                      ) : (
                        <ul className="space-y-1">
                          {item.issues.map((issue) => (
                            <li key={issue}>
                              <Badge
                                variant="outline"
                                className="text-amber-600"
                              >
                                {issueLabel(issue)}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={editHref}>Edit SEO</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={<SearchCheckIcon aria-hidden="true" />}
            title="Tidak ada hasil"
            description="Tidak ada entitas yang cocok dengan filter Anda."
          />
        )}
      </div>
    </div>
  );
}

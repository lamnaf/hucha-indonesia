import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseIcon, PlusIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { JobRepository } from "@/domain/jobs/job.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { employmentTypeLabel, jobStatusLabel } from "@/lib/admin";
import type { JobStatus } from "@/infrastructure/database/generated/client";
import { JobRowActions } from "./job-actions";

export const metadata: Metadata = {
  title: "Karir",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const status = params.status === "open" || params.status === "closed" ? (params.status as JobStatus) : undefined;

  const { items, total } = await new JobRepository().listAdmin({
    page,
    pageSize: PAGE_SIZE,
    search,
    status,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    const qs = query.toString();
    return `/admin/career${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
<PageHeader
        title="Karir"
        description="Lowongan kerja yang tampil di halaman publik."
        actions={
          <Button asChild>
            <Link href="/admin/career/new">
              <PlusIcon className="size-4" aria-hidden="true" />
              Lowongan Baru
            </Link>
          </Button>
        }
      />

      <form
        method="get"
        action="/admin/career"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari judul atau slug..."
          className="max-w-xs"
          aria-label="Cari lowongan"
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
            <option value="open">Dibuka</option>
            <option value="closed">Ditutup</option>
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
                <th className="px-4 py-3 font-medium">Posisi</th>
                <th className="px-4 py-3 font-medium">Departemen</th>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Lamaran</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((job) => (
                <tr key={job.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/career/${job.id}`}>
                      <span className="block font-medium">{job.title}</span>
                      <span className="text-muted-foreground block break-all text-xs">
                        {job.slug}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{job.department ?? "—"}</td>
                  <td className="px-4 py-3">{job.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    {job.employmentType
                      ? employmentTypeLabel(job.employmentType)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={job.status === "open" ? "default" : "secondary"}
                    >
                      {jobStatusLabel(job.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {job._count.applications}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/career/${job.id}`}>Edit</Link>
                      </Button>
                      <JobRowActions
                        jobId={job.id}
                        title={job.title}
                        status={job.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<BriefcaseIcon aria-hidden="true" />}
            title="Belum ada lowongan"
            description="Buat lowongan pertama Anda atau ubah filter pencarian."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} lowongan
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

import type { Metadata } from "next";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { ApplicationRepository } from "@/domain/jobs/application.repository";
import { JobRepository } from "@/domain/jobs/job.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { PageHeader } from "@/components/admin/page-header";
import { applicationStatusLabel, formatDateTime } from "@/lib/admin";
import type { ApplicationStatus } from "@/infrastructure/database/generated/client";

export const metadata: Metadata = {
  title: "Lamaran",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    job?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const status =
    params.status === "new" ||
    params.status === "reviewed" ||
    params.status === "rejected" ||
    params.status === "hired"
      ? (params.status as ApplicationStatus)
      : undefined;
  const jobId = params.job ? Number(params.job) : undefined;

  const [{ items, total }, jobs] = await Promise.all([
    new ApplicationRepository().list({
      page,
      pageSize: PAGE_SIZE,
      search,
      status,
      jobId,
    }),
    new JobRepository().listAdmin({ pageSize: 100 }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (nextPage > 1) query.set("page", String(nextPage));
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (jobId) query.set("job", String(jobId));
    const qs = query.toString();
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lamaran"
        description="Tinjau lamaran masuk dan perbarui status proses rekrutmen."
      />

      <form
        method="get"
        action="/admin/applications"
        className="flex flex-wrap items-end gap-3"
      >
        <Input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Cari nama atau email..."
          className="max-w-xs"
          aria-label="Cari lamaran"
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
            <option value="new">Baru</option>
            <option value="reviewed">Direview</option>
            <option value="rejected">Ditolak</option>
            <option value="hired">Diterima</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground mb-1 block text-xs">
            Lowongan
          </span>
          <select
            name="job"
            defaultValue={jobId ? String(jobId) : ""}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option value="">Semua</option>
            {jobs.items.map((job) => (
              <option key={job.id} value={String(job.id)}>
                {job.title}
              </option>
            ))}
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
                <th className="px-4 py-3 font-medium">Pelamar</th>
                <th className="px-4 py-3 font-medium">Posisi</th>
                <th className="px-4 py-3 font-medium">Dikirim</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((application) => (
                <tr key={application.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{application.fullName}</p>
                    <p className="text-muted-foreground break-all text-xs">
                      {application.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {application.job?.title ?? "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {formatDateTime(application.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        application.status === "new" ? "default" : "secondary"
                      }
                    >
                      {applicationStatusLabel(application.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/applications/${application.id}`}>
                        Detail
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<FileTextIcon aria-hidden="true" />}
            title="Belum ada lamaran"
            description="Lamaran dari halaman Karir akan tampil di sini."
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} dari {total} lamaran
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileTextIcon, MailIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { ApplicationRepository } from "@/domain/jobs/application.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { applicationStatusLabel, formatDateTime } from "@/lib/admin";
import { ApplicationStatusSelect } from "../status-select";
import { DeleteApplicationButton } from "../delete-application-button";

export const metadata: Metadata = {
  title: "Detail Lamaran",
  robots: { index: false, follow: false },
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const applicationId = Number(id);
  if (!Number.isInteger(applicationId)) notFound();

  const application = await new ApplicationRepository().findById(applicationId);
  if (!application) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/applications">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Kembali ke Lamaran
        </Link>
      </Button>

      <PageHeader
        title={application.fullName}
        description={`Lamaran untuk posisi ${application.job?.title ?? "—"} · dikirim ${formatDateTime(application.createdAt)}`}
        actions={
          <DeleteApplicationButton
            applicationId={application.id}
            fullName={application.fullName}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Data Pelamar</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Email</dt>
                <dd className="flex min-w-0 items-center gap-2 text-right">
                  <MailIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${application.email}`}
                    className="text-primary wrap-anywhere underline-offset-2 hover:underline"
                  >
                    {application.email}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Telepon</dt>
                <dd className="min-w-0 wrap-anywhere text-right">
                  {application.phone ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Posisi</dt>
                <dd className="min-w-0 wrap-anywhere text-right">
                  {application.job?.title ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Status</dt>
                <dd className="min-w-0 wrap-anywhere text-right">
                  <Badge
                    variant={
                      application.status === "new" ? "default" : "secondary"
                    }
                  >
                    {applicationStatusLabel(application.status)}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">
                  Ubah status
                </dt>
                <dd className="min-w-0 wrap-anywhere text-right">
                    <ApplicationStatusSelect
                      applicationId={application.id}
                      status={application.status}
                    />
                  </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Catatan Lamaran</h2>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm">
              {application.coverNote || "Tidak ada catatan."}
            </p>
          </section>
        </div>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Berkas</h2>
          {application.cvMedia ? (
            <a
              href={application.cvMedia.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <FileTextIcon className="text-primary size-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {application.cvMedia.fileName}
                </span>
                <span className="text-muted-foreground block text-xs">
                  Buka berkas CV
                </span>
              </span>
            </a>
          ) : (
            <p className="text-muted-foreground text-sm">
              Tidak ada berkas CV.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

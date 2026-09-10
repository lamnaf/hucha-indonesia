import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, MessageSquareTextIcon } from "lucide-react";

import { requireAdmin } from "@/domain/auth/guards";
import { LeadRepository } from "@/domain/leads/lead.repository";
import { UserRepository } from "@/domain/users/user.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateTime } from "@/lib/admin";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/admin";
import { LeadDetailForm } from "../lead-detail-form";
import { LeadNoteForm } from "../lead-note-form";
import { LeadRowActions } from "../lead-actions";

export const metadata: Metadata = {
  title: "Detail Lead",
  robots: { index: false, follow: false },
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId)) notFound();

  const lead = await new LeadRepository().findById(leadId);
  if (!lead) notFound();

  const staff = (await new UserRepository().list({ pageSize: 100 })).items;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/leads">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Kembali ke Leads
        </Link>
      </Button>

      <PageHeader
        title={lead.fullName}
        description={`${LEAD_TYPE_LABELS[lead.type]} · diterima ${formatDateTime(lead.createdAt)}`}
        actions={<LeadRowActions leadId={lead.id} name={lead.fullName} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Pesan</h2>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm">
              {lead.message || (
                <span className="flex items-center gap-2">
                  <MessageSquareTextIcon
                    className="size-4"
                    aria-hidden="true"
                  />
                  Tidak ada pesan tambahan.
                </span>
              )}
            </p>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Tindak Lanjut</h2>
            <LeadDetailForm
              leadId={lead.id}
              status={lead.status}
              assignedToId={lead.assignedToId}
              staff={staff.map((member) => ({
                id: member.id,
                name: member.name,
              }))}
            />
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Catatan</h2>
            {lead.notes ? (
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap text-sm">
                {lead.notes}
              </p>
            ) : (
              <p className="text-muted-foreground mb-4 text-sm">
                Belum ada catatan.
              </p>
            )}
            <LeadNoteForm leadId={lead.id} />
          </section>
        </div>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Data Kontak</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground shrink-0">Tipe</dt>
              <dd>
                <Badge variant="outline">{LEAD_TYPE_LABELS[lead.type]}</Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground shrink-0">Status</dt>
              <dd>
                <Badge
                  variant={lead.status === "new" ? "default" : "secondary"}
                >
                  {LEAD_STATUS_LABELS[lead.status]}
                </Badge>
              </dd>
            </div>
            {lead.companyName ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Perusahaan</dt>
                <dd className="min-w-0 wrap-anywhere text-right">{lead.companyName}</dd>
              </div>
            ) : null}
            {lead.region ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Wilayah</dt>
                <dd className="min-w-0 wrap-anywhere text-right">{lead.region}</dd>
              </div>
            ) : null}
            {lead.email ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Email</dt>
                <dd className="min-w-0 wrap-anywhere text-right">{lead.email}</dd>
              </div>
            ) : null}
            {lead.whatsapp ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">WhatsApp</dt>
                <dd className="min-w-0 wrap-anywhere text-right">{lead.whatsapp}</dd>
              </div>
            ) : null}
            {lead.categoryOfInterest ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">
                  Kategori Minat
                </dt>
                <dd className="min-w-0 wrap-anywhere text-right">{lead.categoryOfInterest}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground shrink-0">Sumber</dt>
              <dd className="min-w-0 wrap-anywhere text-right">{lead.sourcePage ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground shrink-0">Ditugaskan ke</dt>
              <dd className="min-w-0 wrap-anywhere text-right">{lead.assignedToUser?.name ?? "—"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

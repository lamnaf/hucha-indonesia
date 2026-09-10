import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/admin";
import {
  LeadStatus,
  LeadType,
} from "@/infrastructure/database/generated/client";
import { LeadRepository } from "@/domain/leads/lead.repository";

/**
 * Shared admin leads export helpers (blueprint §36). CSV and XLS export
 * routes reuse the same filter parsing, column headers, and row mapping so
 * the exported shape can never drift between formats.
 */

export interface LeadExportFilters {
  type?: LeadType;
  status?: LeadStatus;
  search?: string;
  archived?: boolean;
}

export const LEAD_EXPORT_HEADERS = [
  "ID",
  "Tanggal",
  "Tipe",
  "Nama",
  "Perusahaan",
  "Wilayah",
  "WhatsApp",
  "Email",
  "Kategori Minat",
  "Status",
  "Pesan",
  "Sumber",
  "Ditugaskan ke",
  "Terarsip",
] as const;

export type ExportableLead = Awaited<
  ReturnType<LeadRepository["exportAll"]>
>[number];

function isEnumValue<T extends string>(
  value: string | undefined,
  enumObject: Record<string, T>
): value is T {
  return Boolean(value && Object.values(enumObject).includes(value as T));
}

/** Parses `?type=&status=&search=&archived=` from an export URL. */
export function parseLeadExportFilters(url: URL): LeadExportFilters {
  const rawType = url.searchParams.get("type") ?? undefined;
  const rawStatus = url.searchParams.get("status") ?? undefined;
  const search = url.searchParams.get("search")?.trim() || undefined;
  const archived = url.searchParams.get("archived") === "1";

  return {
    type: isEnumValue(rawType, LeadType) ? rawType : undefined,
    status: isEnumValue(rawStatus, LeadStatus) ? rawStatus : undefined,
    search,
    archived: archived ? true : undefined,
  };
}

/** Builds an export row for a lead (labels resolved, nulls → ""). */
export function toLeadExportRow(lead: ExportableLead): string[] {
  return [
    String(lead.id),
    lead.createdAt.toISOString(),
    LEAD_TYPE_LABELS[lead.type],
    lead.fullName,
    lead.companyName ?? "",
    lead.region ?? "",
    lead.whatsapp ?? "",
    lead.email ?? "",
    lead.categoryOfInterest ?? "",
    LEAD_STATUS_LABELS[lead.status],
    lead.message ?? "",
    lead.sourcePage ?? "",
    lead.assignedToUser?.name ?? "",
    lead.archived ? "Ya" : "Tidak",
  ];
}
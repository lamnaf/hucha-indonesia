import { requireAdmin } from "@/domain/auth/guards";
import { LeadRepository } from "@/domain/leads/lead.repository";
import {
  LEAD_EXPORT_HEADERS,
  parseLeadExportFilters,
  toLeadExportRow,
} from "@/domain/leads/leads-export";

/**
 * Admin leads export (blueprint §36 leads). Produces a UTF-8 BOM CSV that
 * opens natively in Excel/Google Sheets, respecting the current list filters.
 */
export async function GET(request: Request) {
  await requireAdmin();

  const filters = parseLeadExportFilters(new URL(request.url));

  const leads = await new LeadRepository().exportAll(filters);

  const rows = [
    [...LEAD_EXPORT_HEADERS],
    ...leads.map((lead) => toLeadExportRow(lead)),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell.replace(/"/g, '""');
          return /[",\n]/.test(value) ? `"${value}"` : value;
        })
        .join(",")
    )
    .join("\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${stamp}.csv"`,
    },
  });
}
import { requireAdmin } from "@/domain/auth/guards";
import { LeadRepository } from "@/domain/leads/lead.repository";
import {
  LEAD_EXPORT_HEADERS,
  parseLeadExportFilters,
  toLeadExportRow,
} from "@/domain/leads/leads-export";

/**
 * Admin leads export to Excel (blueprint §36 leads). Emits a legacy
 * SpreadsheetML 2003 document (`.xls`) that opens natively in Excel, Google
 * Sheets, and LibreOffice without pulling in a heavyweight binary writer.
 * Respects the current list filters and reuses the same query as CSV.
 */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** 1-based SpreadsheetML column letters (A, B, ... Z, AA, ...). */
function columnLetters(count: number): string[] {
  const letters: string[] = [];
  for (let i = 0; i < count; i += 1) {
    let n = i;
    let label = "";
    while (n >= 0) {
      label = String.fromCharCode(65 + (n % 26)) + label;
      n = Math.floor(n / 26) - 1;
    }
    letters.push(label);
  }
  return letters;
}

/** Serializes a row of cells into SpreadsheetML `<Cell>` elements. */
function renderRowCells(
  cells: readonly string[],
  letters: readonly string[],
  rowNumber: number,
  styleId: string
): string {
  return cells
    .map(
      (value, index) =>
        `<Cell ss:StyleID="${styleId}" ss:Index="${index + 1}" ss:Ref="${letters[index]}${rowNumber}"><Data ss:Type="String">${xmlEscape(
          value
        )}</Data></Cell>`
    )
    .join("");
}

function toExcelDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

const HEADERS: readonly string[] = [...LEAD_EXPORT_HEADERS];

export async function GET(request: Request) {
  await requireAdmin();

  const filters = parseLeadExportFilters(new URL(request.url));
  const leads = await new LeadRepository().exportAll(filters);

  const letters = columnLetters(HEADERS.length);

  const headerRow = renderRowCells(HEADERS, letters, 1, "header");

  const dataRows = leads
    .map((lead, rowIndex) => {
      const rowNumber = rowIndex + 2;
      const row = toLeadExportRow(lead);
      row[1] = toExcelDate(lead.createdAt);
      return `<Row ss:Height="20">${renderRowCells(
        row,
        letters,
        rowNumber,
        "wrap"
      )}</Row>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="wrap">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Leads">
  <Table>
   <Row ss:Height="20">${headerRow}</Row>
   ${dataRows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes><FrozenView>1</FrozenView></FreezePanes>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${stamp}.xls"`,
    },
  });
}
/**
 * Small FormData parsing helpers shared by admin server actions. Server
 * actions receive string form values, so each action normalizes them before
 * passing to the shared zod schemas.
 */

export function toOptionalString(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export function toOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function toBoolean(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

export function toNumberArray(value: FormDataEntryValue | null): number[] {
  if (value === null) return [];
  return String(value)
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export function toNullableString(value: FormDataEntryValue | null): string | null {
  if (value === null) return "";
  const s = String(value).trim();
  return s === "" ? null : s;
}

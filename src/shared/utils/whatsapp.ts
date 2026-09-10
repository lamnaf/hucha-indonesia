/**
 * Normalizes an Indonesian phone number to the canonical `+62` format.
 * Accepts `+62`, `62`, or `0` prefixes; strips spaces, dashes and parentheses.
 * After normalization, the number must contain 9–13 digits (blueprint §31).
 */
export function normalizeIndonesianWhatsApp(input: string): string {
  const digitsOnly = input.replace(/[^\d]/g, "");

  if (digitsOnly.startsWith("62")) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith("0")) {
    return `+62${digitsOnly.slice(1)}`;
  }
  return `+${digitsOnly}`;
}

/**
 * Matches a canonical Indonesian mobile number (`+628xxxxxxxxxx`).
 * 9–13 digits after the +62 prefix.
 */
export const INDONESIAN_WHATSAPP_PATTERN = /^\+62(8[1-9]\d{7,11})$/;

/**
 * True when the input is a structurally valid Indonesian mobile number.
 */
export function isValidIndonesianWhatsApp(input: string): boolean {
  return INDONESIAN_WHATSAPP_PATTERN.test(normalizeIndonesianWhatsApp(input));
}

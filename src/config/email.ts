/**
 * Optional SMTP configuration (blueprint §41 SMTP_* vars). Email delivery
 * is best-effort (§29) and never blocks the primary DB write, so all values
 * are optional at runtime — a missing config simply disables sending.
 */

export interface EmailConfig {
  enabled: boolean;
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

function env(key: string): string | undefined {
  const value = process.env[key];
  return value === undefined || value === "" ? undefined : value;
}

function port(): number | undefined {
  const raw = env("SMTP_PORT");
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function getEmailConfig(): EmailConfig {
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const from = env("SMTP_FROM");
  return {
    enabled: host !== undefined && port() !== undefined && from !== undefined,
    host: host ?? "",
    port: port() ?? 587,
    user,
    pass: env("SMTP_PASS"),
    from: from ?? "",
  };
}

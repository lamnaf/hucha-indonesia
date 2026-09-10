function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function appEnvValue(): string {
  const explicit = process.env.APP_ENV;
  if (explicit) {
    return explicit;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function assertHttpUrl(key: string, value: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `Invalid ${key}: "${value}" is not a valid absolute URL (e.g. https://hucha.id).`
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Invalid ${key}: protocol must be http(s), got "${parsed.protocol}".`);
  }
}

function assertBetterAuthSecret(value: string): void {
  if (value === "change-me" || value.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be at least 32 characters and not the placeholder " +
        "value. Generate one with: openssl rand -base64 32"
    );
  }
}

const appEnv = appEnvValue();
const isProduction = appEnv === "production";

const appUrl = env("APP_URL");
assertHttpUrl("APP_URL", appUrl);

const betterAuthSecret = env("BETTER_AUTH_SECRET");
if (isProduction) {
  assertBetterAuthSecret(betterAuthSecret);
}

const betterAuthUrl = env("BETTER_AUTH_URL", "");
if (betterAuthUrl) {
  assertHttpUrl("BETTER_AUTH_URL", betterAuthUrl);
}

export const config = {
  appEnv,
  isProduction,
  appUrl,
  databaseUrl: env("DATABASE_URL"),
  betterAuthSecret,
  betterAuthUrl,
  whatsappAdminNumber: env("WHATSAPP_ADMIN_NUMBER", ""),
} as const;

import nodemailer, { type Transporter } from "nodemailer";
import { getEmailConfig } from "@/config/email";

/**
 * SMTP email adapter (blueprint §29–30, §39). Email delivery is
 * best-effort and async-safe: a send failure is logged and retried up to 3
 * times with exponential backoff, and must never block the primary DB write
 * that created the lead/application (§29 edge case: "DB write always
 * succeeds first, notification is best-effort async"). When SMTP is not
 * configured the adapter is a no-op, so the site works without email
 * infra (dev / local without mailhog).
 */

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 1000;

function createTransporter(): Transporter | null {
  const config = getEmailConfig();
  if (!config.enabled) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user
      ? { user: config.user, pass: config.pass ?? "" }
      : undefined,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface EmailMessage {
  to: string[];
  subject: string;
  text: string;
}

/**
 * Sends an email with retry. Never throws — returns false when sending is
 * disabled or all attempts fail, so callers can treat delivery as optional.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }
  const { from } = getEmailConfig();

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await transporter.sendMail({
        from,
        to: message.to.join(", "),
        subject: message.subject,
        text: message.text,
      });
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
      }
    }
  }
  console.error(
    "[email] failed to deliver",
    JSON.stringify({ subject: message.subject, to: message.to }),
    lastError
  );
  return false;
}

/**
 * Best-effort multi-recipient send used by the notification service. A
 * failure is swallowed (logged by sendEmail) so the caller never has to
 * guard against delivery errors.
 */
export async function trySendEmail(message: EmailMessage): Promise<void> {
  try {
    await sendEmail(message);
  } catch (error) {
    console.error("[email] unexpected error", error);
  }
}

import { NotificationType } from "@/infrastructure/database/generated/client";
import { prisma } from "@/infrastructure/database/prisma";
import { SettingRepository } from "@/domain/settings/setting.repository";
import { NotificationRepository } from "@/domain/users/notification.repository";
import { trySendEmail } from "@/infrastructure/email/send-email";

/**
 * Notification service (blueprint §29–30): fires in-app notifications and
 * transactional emails when a new lead or job application is submitted.
 *
 * Design rules (from §29):
 * - Best-effort by construction — a notification/email failure must never
 *   block or roll back the lead/application DB write, so this module is
 *   called AFTER the repository write and never throws to its caller.
 * - In-app recipients are the active administrator accounts (single Super
 *   Admin role) who act on the data. Emails use the
 *   `notification_recipients` settings (configurable per lead type per §29).
 */

interface LeadEvent {
  type: "distributor" | "supplier" | "oem" | "contact";
  fullName: string;
  companyName?: string | null;
  region?: string | null;
}

interface ApplicationEvent {
  jobTitle: string;
  applicantName: string;
}

const RECIPIENT_SETTING_KEY = "notification_recipients";

/**
 * Creates an in-app notification row for every active administrator.
 * Best-effort — individual failures are logged, never thrown.
 */
async function notifyInApp(
  type: NotificationType,
  title: string,
  body?: string
): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true, isAdmin: true },
      select: { id: true },
    });
    const repo = new NotificationRepository();
    await Promise.all(
      users.map((u) =>
        repo.create({ userId: u.id, type, title, body: body ?? null })
      )
    );
  } catch (error) {
    console.error("[notify] failed to create in-app notification", error);
  }
}

/**
 * Fires a lead notification: in-app rows for lead-managing admins plus an
 * email to the configured recipients for that lead type. Never throws.
 */
export async function notifyLeadCreated(event: LeadEvent): Promise<void> {
  const templates = leadEmailTemplates(event);
  const setting = await new SettingRepository().get<Record<string, string[]>>(
    RECIPIENT_SETTING_KEY
  );
  const recipients = setting?.[`${event.type}Leads`];

  if (recipients && recipients.length > 0) {
    await trySendEmail({
      to: recipients,
      subject: templates.subject,
      text: templates.text,
    });
  }
  await notifyInApp("lead", templates.subject, templates.text);
}

/**
 * Fires a job-application notification: in-app rows for application-managing
 * admins plus an email to the configured recipients. Never throws.
 */
export async function notifyApplicationCreated(
  event: ApplicationEvent
): Promise<void> {
  const subject = `Lamaran Baru: ${event.jobTitle} – ${event.applicantName}`;
  const text =
    `Lamaran baru diterima.\n\n` +
    `Posisi: ${event.jobTitle}\n` +
    `Nama pelamar: ${event.applicantName}\n\n` +
    `Buka panel admin untuk melihat detail lamaran: ${process.env.APP_URL ?? ""}`;

  const setting = await new SettingRepository().get<Record<string, string[]>>(
    RECIPIENT_SETTING_KEY
  );
  const recipients = setting?.applications;

  if (recipients && recipients.length > 0) {
    await trySendEmail({ to: recipients, subject, text });
  }
  await notifyInApp("application", subject, text);
}

function leadEmailTemplates(event: LeadEvent): {
  subject: string;
  text: string;
} {
  const baseText = (line: string, body: string) =>
    `${line}\n\n${body}\n\nBuka panel admin untuk melihat detail: ${process.env.APP_URL ?? ""}`;
  switch (event.type) {
    case "distributor":
      return {
        subject: `Lead Kemitraan Baru: ${event.fullName} – ${event.region ?? "-"}`,
        text: baseText(
          `Lead Kemitraan Baru: ${event.fullName}`,
          `Nama: ${event.fullName}\nWilayah: ${event.region ?? "-"}`
        ),
      };
    case "oem":
      return {
        subject: `Inquiry OEM Baru: ${event.companyName ?? event.fullName}`,
        text: baseText(
          `Inquiry OEM Baru: ${event.companyName ?? event.fullName}`,
          `Perusahaan: ${event.companyName ?? "-"}\nPIC: ${event.fullName}`
        ),
      };
    case "supplier":
      return {
        subject: `Lead Supplier Baru: ${event.companyName ?? event.fullName} – ${event.region ?? "-"}`,
        text: baseText(
          `Lead Supplier Baru: ${event.companyName ?? event.fullName}`,
          `Perusahaan: ${event.companyName ?? "-"}\nPIC: ${event.fullName}\nWilayah: ${event.region ?? "-"}`
        ),
      };
    case "contact":
      return {
        subject: `Pesan Kontak Baru dari ${event.fullName}`,
        text: baseText(
          `Pesan Kontak Baru dari ${event.fullName}`,
          `Nama: ${event.fullName}\nWilayah: ${event.region ?? "-"}`
        ),
      };
  }
}

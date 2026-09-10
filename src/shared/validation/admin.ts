import { z } from "zod";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from "@/shared/validation/common";

/**
 * Admin foundation validation (blueprint §31, §36).
 * Shared by admin server actions and their client-side forms so validation
 * can never drift (RULES.md / §38).
 */

/** Edit own profile — name/email only (password handled separately). */
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;

/** Change own password — current password + new password (§31 password rules). */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

const emailListSchema = z
  .array(emailSchema)
  .max(10, "Maksimal 10 alamat email per jenis notifikasi");

/** Site-wide settings groups (blueprint §16 settings key/value JSONB). */
export const companySettingsSchema = z.object({
  name: nameSchema,
  legalName: z
    .string()
    .trim()
    .min(2, "Nama legal minimal 2 karakter")
    .max(120, "Nama legal maksimal 120 karakter"),
  address: z
    .string()
    .trim()
    .min(5, "Alamat minimal 5 karakter")
    .max(255, "Alamat maksimal 255 karakter"),
  phone: z.string().trim().min(6, "Nomor telepon tidak valid").max(20),
  email: emailSchema,
  whatsapp: z.string().trim().min(9, "Nomor WhatsApp tidak valid").max(20),
});

export const socialSettingsSchema = z.object({
  instagram: z.union([z.string().trim().max(2048), z.literal("")]),
  tiktok: z.union([z.string().trim().max(2048), z.literal("")]),
  whatsapp: z.union([z.string().trim().max(2048), z.literal("")]),
});

export const seoSettingsSchema = z.object({
  defaultMetaTitle: z
    .string()
    .trim()
    .min(10, "Meta title minimal 10 karakter")
    .max(120, "Meta title maksimal 120 karakter"),
  defaultMetaDescription: z
    .string()
    .trim()
    .min(30, "Meta description minimal 30 karakter")
    .max(320, "Meta description maksimal 320 karakter"),
});

export const notificationRecipientsSchema = z.object({
  distributorLeads: emailListSchema,
  oemLeads: emailListSchema,
  contactLeads: emailListSchema,
  applications: emailListSchema,
});

/** Outgoing SMTP settings for transactional email (§34). */
export const smtpSettingsSchema = z.object({
  host: z.union([z.string().trim().min(1, "Host SMTP wajib diisi").max(255), z.literal("")]),
  port: z.coerce.number().int().min(1).max(65535).or(z.literal("")),
  user: z.union([z.string().trim().max(255), z.literal("")]),
  password: z.union([z.string().max(255), z.literal("")]),
  fromName: z
    .union([z.string().trim().min(1, "Nama pengirim wajib diisi").max(120), z.literal("")]),
  fromEmail: emailSchema.or(z.literal("")),
  secure: z.boolean().default(true),
});

/** Third-party analytics & tag-manager codes. */
const analyticsCodeSchema = z.union([
  z
    .string()
    .trim()
    .regex(/^G-[A-Z0-9]{6,}$/i, "ID Google Analytics tidak valid (contoh: G-XXXXXXXXXX)")
    .max(60),
  z.literal(""),
]);
const tagManagerCodeSchema = z.union([
  z
    .string()
    .trim()
    .regex(/^GTM-[A-Z0-9]{4,}$/i, "ID Google Tag Manager tidak valid (contoh: GTM-XXXXXXX)")
    .max(60),
  z.literal(""),
]);

export const analyticsSettingsSchema = z.object({
  googleAnalyticsId: analyticsCodeSchema,
  googleTagManagerId: tagManagerCodeSchema,
});

/** Logo/favicon/media asset keys (stored as file paths from direct uploads). */
export const mediaSettingsSchema = z.object({
  logo: z.union([z.string().trim().max(255), z.literal("")]),
  favicon: z.union([z.string().trim().max(255), z.literal("")]),
  ogImage: z.union([z.string().trim().max(255), z.literal("")]),
});

/** Homepage SEO overrides. */
export const homepageSeoSettingsSchema = z.object({
  metaTitle: z.union([z.string().trim().max(120), z.literal("")]),
  metaDescription: z.union([z.string().trim().max(320), z.literal("")]),
  ogImage: z.union([z.string().trim().max(255), z.literal("")]),
});

/**
 * Settings groups and their validation (blueprint §16 settings JSONB).
 * Shared by the server action and the client form so the group→schema map
 * can never drift.
 */
export const SETTINGS_GROUPS = {
  company: companySettingsSchema,
  social: socialSettingsSchema,
  seo: seoSettingsSchema,
  smtp: smtpSettingsSchema,
  analytics: analyticsSettingsSchema,
  media: mediaSettingsSchema,
  homepage_seo: homepageSeoSettingsSchema,
  notification_recipients: notificationRecipientsSchema,
} as const;

export type SettingsGroup = keyof typeof SETTINGS_GROUPS;

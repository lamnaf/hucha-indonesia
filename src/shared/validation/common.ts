import { z } from "zod";
import {
  isValidIndonesianWhatsApp,
  normalizeIndonesianWhatsApp,
} from "@/shared/utils/whatsapp";
import { stripHtml } from "@/shared/utils/text";

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase, ASCII, hyphen-separated"
  );

export const emailSchema = z
  .email("Email tidak valid")
  .max(255, "Email maksimal 255 karakter");

/**
 * Absolute http/https URL. Rejects `javascript:`, `data:` and other
 * executable schemes to prevent a stored clickable-URL XSS vector (§32).
 */
export const urlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "URL harus berupa tautan http/https yang valid");

/**
 * Indonesian mobile number. Accepted on input as `0`, `62` or `+62` prefixes;
 * normalized and stored in the canonical `+62` format (blueprint §22/§31).
 */
export const whatsappSchema = z
  .string()
  .min(9, "Nomor WhatsApp tidak valid")
  .max(20, "Nomor WhatsApp tidak valid")
  .refine(isValidIndonesianWhatsApp, {
    message: "Nomor WhatsApp harus nomor seluler Indonesia (08.../+62 8...)",
  })
  .transform(normalizeIndonesianWhatsApp);

export const nameSchema = z
  .string()
  .trim()
  .min(3, "Nama minimal 3 karakter")
  .max(100, "Nama maksimal 100 karakter");

export const companyNameSchema = z
  .string()
  .trim()
  .min(2, "Nama perusahaan minimal 2 karakter")
  .max(120, "Nama perusahaan maksimal 120 karakter");

export const idSchema = z
  .number()
  .int()
  .positive("ID harus bilangan bulat positif");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Free-text message field: HTML stripped on save, min length to reduce
 * low-effort spam, hard max (blueprint §31).
 */
export function messageSchema(min = 20, max = 2000) {
  return z
    .string()
    .transform((value) => stripHtml(value))
    .pipe(
      z
        .string()
        .min(min, `Pesan minimal ${min} karakter`)
        .max(max, `Pesan maksimal ${max} karakter`)
    );
}

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "1234567890",
  "qwerty12345",
  "admin123456",
  "letmein1234",
  "superadmin",
]);

/**
 * Admin password: min 10 chars, at least one number and one letter,
 * rejected if on the common-password blocklist (blueprint §31).
 */
export const passwordSchema = z
  .string()
  .min(10, "Kata sandi minimal 10 karakter")
  .max(128)
  .regex(/[a-zA-Z]/, "Kata sandi harus mengandung minimal 1 huruf")
  .regex(/\d/, "Kata sandi harus mengandung minimal 1 angka")
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), {
    message: "Kata sandi terlalu umum, pilih yang lebih kuat",
  });

export const metaTitleSchema = z
  .string()
  .trim()
  .min(10, "Meta title minimal 10 karakter")
  .max(120, "Meta title maksimal 120 karakter");

export const metaDescriptionSchema = z
  .string()
  .trim()
  .min(30, "Meta description minimal 30 karakter")
  .max(320, "Meta description maksimal 320 karakter");

export const employmentTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "internship",
]);

/**
 * Simple name+slug taxonomy record (blog categories, tags, FAQ categories).
 * Shared so blog and FAQ modules validate identically (blueprint §25/§30).
 */
export const taxonomySchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  slug: slugSchema.optional(),
});

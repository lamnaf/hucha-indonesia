import { z } from "zod";
import {
  emailSchema,
  employmentTypeSchema,
  nameSchema,
  slugSchema,
} from "@/shared/validation/common";

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Judul lowongan minimal 5 karakter")
    .max(120, "Judul lowongan maksimal 120 karakter"),
  slug: slugSchema.optional(),
  department: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
  employmentType: employmentTypeSchema.default("full_time"),
  description: z
    .string()
    .min(20, "Deskripsi lowongan minimal 20 karakter")
    .max(10000),
  requirements: z
    .string()
    .min(20, "Persyaratan minimal 20 karakter")
    .max(10000),
  status: z.enum(["open", "closed"]).default("open"),
});

/**
 * Job application (FR-07 / §24). CV file is stored via the media/storage
 * service and referenced by `cvMediaId`; the upload itself enforces
 * pdf/doc/docx + max 5MB server-side.
 */
export const applicationSchema = z.object({
  jobId: z.number().int().positive(),
  fullName: nameSchema,
  email: emailSchema,
  phone: z.string().trim().max(20).optional().nullable(),
  coverNote: z.string().trim().max(2000).optional().nullable(),
  cvMediaId: z.number().int().positive("Unggah CV wajib diisi"),
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum(["new", "reviewed", "rejected", "hired"]),
});

export const jobStatusUpdateSchema = z.object({
  status: z.enum(["open", "closed"]),
});

export type JobInput = z.input<typeof jobSchema>;
export type ApplicationInput = z.input<typeof applicationSchema>;

import { z } from "zod";
import {
  companyNameSchema,
  emailSchema,
  messageSchema,
  nameSchema,
  whatsappSchema,
} from "@/shared/validation/common";

/**
 * Distributor registration (blueprint §22 / FR-05).
 * Validation: name 3–100, region, WhatsApp must be an Indonesian mobile number.
 */
export const distributorLeadSchema = z.object({
  fullName: nameSchema,
  region: z
    .string()
    .trim()
    .min(2, "Wilayah minimal 2 karakter")
    .max(100, "Wilayah maksimal 100 karakter"),
  whatsapp: whatsappSchema,
  businessType: z.string().trim().max(100).optional().nullable(),
  sourcePage: z.string().trim().max(255).optional().nullable(),
});

/**
 * OEM / maklon inquiry (blueprint §23 / FR-06).
 * At least one contact method (WhatsApp or Email) must be valid;
 * message 20–2000 chars, HTML stripped.
 */
export const oemLeadSchema = z
  .object({
    companyName: companyNameSchema,
    picName: nameSchema,
    whatsapp: whatsappSchema.optional().or(z.literal("")),
    email: emailSchema.optional().or(z.literal("")),
    categoryOfInterest: z.enum(["fluids", "lubricants", "autocare", "other"]),
    message: messageSchema(20, 2000),
    sourcePage: z.string().trim().max(255).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    const hasWhatsapp = Boolean(value.whatsapp);
    const hasEmail = Boolean(value.email);
    if (!hasWhatsapp && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimal salah satu kontak (WhatsApp atau Email) wajib diisi",
        path: ["whatsapp"],
      });
    }
  });

/**
 * General contact inquiry (FR-09 / §36 POST /api/leads/contact).
 */
export const contactLeadSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  message: messageSchema(10, 2000),
  sourcePage: z.string().trim().max(255).optional().nullable(),
});

/**
 * Admin lead update (FR-15): status tagging and optional assignment.
 */
export const leadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "rejected"]),
  assignedToId: z.number().int().positive().nullable().optional(),
});

/**
 * Admin lead note appended to the lead's note trail (FR-15).
 */
export const leadNoteSchema = z
  .string()
  .trim()
  .min(1, "Catatan minimal 1 karakter")
  .max(1000, "Catatan maksimal 1000 karakter");

export type DistributorLeadInput = z.input<typeof distributorLeadSchema>;
export type OemLeadInput = z.input<typeof oemLeadSchema>;
export type ContactLeadInput = z.input<typeof contactLeadSchema>;
export type LeadUpdateInput = z.input<typeof leadUpdateSchema>;

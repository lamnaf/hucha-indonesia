import { z } from "zod";

export const testimonialSchema = z.object({
  partnerName: z
    .string()
    .trim()
    .min(3, "Nama partner minimal 3 karakter")
    .max(120, "Nama partner maksimal 120 karakter"),
  partnerBusiness: z.string().trim().max(120).optional().nullable(),
  partnerRegion: z.string().trim().max(120).optional().nullable(),
  quote: z
    .string()
    .trim()
    .min(10, "Kutipan minimal 10 karakter")
    .max(2000, "Kutipan maksimal 2000 karakter"),
  partnerLogoMediaId: z.number().int().positive().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  isPublished: z.boolean().default(false),
});

export type TestimonialInput = z.input<typeof testimonialSchema>;

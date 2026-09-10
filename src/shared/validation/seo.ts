import { z } from "zod";
import {
  metaDescriptionSchema,
  metaTitleSchema,
  slugSchema,
} from "@/shared/validation/common";

/**
 * SEO metadata fields shared by Product and Article forms (blueprint §13/§27).
 */
export const seoSchema = z.object({
  entityType: z.enum(["product", "article"]),
  entityId: z.number().int().positive(),
  metaTitle: metaTitleSchema.optional().nullable(),
  metaDescription: metaDescriptionSchema.optional().nullable(),
  slugOverride: slugSchema.optional().nullable(),
  ogImageMediaId: z.number().int().positive().nullable().optional(),
  ogTitle: z.string().trim().max(120).optional().nullable(),
  ogDescription: z.string().trim().max(300).optional().nullable(),
  twitterCard: z
    .enum(["summary", "summary_large_image", "app", "player"])
    .optional()
    .nullable(),
  robots: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-z,\s-]*$/i, "Robots hanya boleh berisi label seperti index, noindex, follow")
    .optional()
    .nullable(),
  keywords: z.string().trim().max(500).optional().nullable(),
  canonicalUrl: z.url().max(2048).optional().nullable(),
});

export type SeoInput = z.input<typeof seoSchema>;

import { z } from "zod";
import { idSchema, slugSchema } from "@/shared/validation/common";

/**
 * Brand create/update (blueprint §16 commerce-adjacent content).
 * Highlights are stored as a JSON array (max 10 items).
 */
export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama merek minimal 2 karakter")
    .max(120, "Nama merek maksimal 120 karakter"),
  slug: slugSchema.optional(),
  tagline: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.enum(["spareparts", "fluids", "autocare"]),
  logoMediaId: idSchema.nullable().optional(),
  highlights: z
    .array(z.string().trim().min(1).max(120))
    .max(10, "Maksimal 10 poin keunggulan")
    .default([]),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export type BrandInput = z.input<typeof brandSchema>;

import { z } from "zod";
import { idSchema, slugSchema, urlSchema } from "@/shared/validation/common";

export const marketplaceLinksSchema = z.object({
  tiktokshopUrl: urlSchema.optional().nullable(),
});

/**
 * Product create/update (blueprint §21 / §16).
 * Name 3–120 chars; at least one marketplace URL required when publishing;
 * images max 5 (media library ids); category required.
 */
export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nama produk minimal 3 karakter")
      .max(120, "Nama produk maksimal 120 karakter"),
    slug: slugSchema.optional(),
    categoryId: idSchema,
    subCategoryId: idSchema.nullable().optional(),
    brandId: idSchema.nullable().optional(),
    shortDescription: z.string().trim().max(300).optional().nullable(),
    description: z.string().optional().nullable(),
    tiktokshopUrl: urlSchema.optional().nullable(),
    isFeatured: z.boolean().optional().default(false),
    status: z.enum(["draft", "published"]).default("draft"),
    images: z
      .array(idSchema)
      .max(5, "Maksimal 5 gambar per produk")
      .optional()
      .default([]),
  })
  .superRefine((value, ctx) => {
    if (value.status === "published") {
      const hasMarketplaceLink = Boolean(
        value.tiktokshopUrl
      );
      if (!hasMarketplaceLink) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Produk yang dipublikasikan wajib memiliki minimal 1 link marketplace",
          path: ["tiktokshopUrl"],
        });
      }
      if (value.images.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Produk yang dipublikasikan wajib memiliki minimal 1 gambar",
          path: ["images"],
        });
      }
    }
  });

export const productFilterSchema = z.object({
  category: slugSchema.optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.output<typeof productSchema>;
export type ProductFilter = z.input<typeof productFilterSchema>;

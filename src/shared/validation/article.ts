import { z } from "zod";
import { idSchema, slugSchema } from "@/shared/validation/common";
import { seoSchema } from "@/shared/validation/seo";

/**
 * Article create/update (blueprint §25 / §16).
 * Title 10–120 chars; body optional on draft, encouraged (soft) for publish.
 * SEO fields validated when provided.
 */
export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Judul minimal 10 karakter")
    .max(120, "Judul maksimal 120 karakter"),
  slug: slugSchema.optional(),
  blogCategoryId: idSchema,
  featuredMediaId: idSchema.nullable().optional(),
  excerpt: z.string().trim().max(500).optional().nullable(),
  body: z.string().optional().nullable(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  isFeatured: z.boolean().optional().default(false),
  publishedAt: z.iso.datetime().optional().nullable(),
  tagIds: z.array(idSchema).max(20).optional().default([]),
  seo: seoSchema.omit({ entityType: true, entityId: true }).optional(),
});

export const articleFilterSchema = z.object({
  category: slugSchema.optional(),
  tag: slugSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ArticleInput = z.input<typeof articleSchema>;
export type ArticleFilter = z.input<typeof articleFilterSchema>;

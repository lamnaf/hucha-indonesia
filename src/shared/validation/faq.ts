import { z } from "zod";
import { taxonomySchema } from "@/shared/validation/common";

export const faqSchema = z.object({
  faqCategoryId: z.number().int().positive(),
  question: z
    .string()
    .trim()
    .min(5, "Pertanyaan minimal 5 karakter")
    .max(500, "Pertanyaan maksimal 500 karakter"),
  answer: z
    .string()
    .trim()
    .min(10, "Jawaban minimal 10 karakter")
    .max(5000, "Jawaban maksimal 5000 karakter"),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const faqCategorySchema = taxonomySchema;

export type FaqInput = z.input<typeof faqSchema>;
export type FaqCategoryInput = z.input<typeof faqCategorySchema>;

import { z } from "zod";
import { idSchema, slugSchema } from "@/shared/validation/common";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama kategori minimal 3 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  slug: slugSchema.optional(),
  type: z.enum(["spareparts", "fluids", "autocare"]),
  parentId: idSchema.nullable().optional(),
});

export type CategoryInput = z.input<typeof categorySchema>;

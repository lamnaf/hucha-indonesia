import type { Metadata } from "next";
import { z } from "zod";

import { requireAdmin } from "@/domain/auth/guards";
import { BrandRepository } from "@/domain/brands/brand.repository";
import { NotFoundError } from "@/domain/errors";
import { BrandForm } from "../brand-form";

export const metadata: Metadata = {
  title: "Edit Merek",
  robots: { index: false, follow: false },
};

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const brandId = Number(id);
  if (!Number.isInteger(brandId)) {
    throw new NotFoundError("Merek tidak ditemukan");
  }

  const brand = await new BrandRepository().findById(brandId);
  if (!brand) {
    throw new NotFoundError(`Merek #${brandId} tidak ditemukan`);
  }

  const highlights = z.array(z.string()).safeParse(brand.highlights).data ?? [];

  return (
    <BrandForm
      initialLogoUrl={brand.logo?.filePath ?? null}
      initial={{
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        tagline: brand.tagline,
        description: brand.description,
        category: brand.category,
        logoMediaId: brand.logoMediaId,
        highlights,
        sortOrder: brand.sortOrder,
        isPublished: brand.isPublished,
      }}
    />
  );
}

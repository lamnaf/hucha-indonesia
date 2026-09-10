import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { FaqRepository } from "@/domain/faqs/faq.repository";
import { FaqForm } from "../faq-form";

export const metadata: Metadata = {
  title: "FAQ Baru",
  robots: { index: false, follow: false },
};

export default async function NewFaqPage() {
  await requireAdmin();

  const categories = await new FaqRepository().listCategories();

  return (
    <FaqForm
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
      }))}
    />
  );
}

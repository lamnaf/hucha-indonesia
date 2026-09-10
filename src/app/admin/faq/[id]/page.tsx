import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/domain/auth/guards";
import { FaqRepository } from "@/domain/faqs/faq.repository";
import { FaqForm } from "../faq-form";

export const metadata: Metadata = {
  title: "Edit FAQ",
  robots: { index: false, follow: false },
};

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const faqId = Number(id);
  if (!Number.isInteger(faqId)) notFound();

  const [faq, categories] = await Promise.all([
    new FaqRepository().findById(faqId),
    new FaqRepository().listCategories(),
  ]);
  if (!faq) notFound();

  return (
    <FaqForm
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
      }))}
      initial={{
        id: faq.id,
        faqCategoryId: faq.faqCategoryId,
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
        isPublished: faq.isPublished,
      }}
    />
  );
}

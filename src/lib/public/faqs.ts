import { FaqRepository } from "@/domain/faqs/faq.repository";
import type { MockFaqCategory } from "@/lib/mock/faqs";

/**
 * Published FAQs grouped by category. The mock grouped them statically; with
 * the CMS as source of truth we group the published rows at render time.
 */
export async function getFaqCategories(): Promise<MockFaqCategory[]> {
  try {
    const items = await new FaqRepository().listPublished();
    const groups = new Map<number, MockFaqCategory>();

    for (const faq of items) {
      const category = faq.faqCategory;
      const existing = groups.get(category.id);
      if (existing) {
        existing.questions.push({ question: faq.question, answer: faq.answer });
      } else {
        groups.set(category.id, {
          name: category.name,
          slug: category.slug,
          questions: [{ question: faq.question, answer: faq.answer }],
        });
      }
    }

    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));
  } catch (err) {
    console.error("[faqs] getFaqCategories failed:", err);
    return [];
  }
}

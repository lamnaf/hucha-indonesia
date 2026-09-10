import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import { TagRepository } from "@/domain/articles/tag.repository";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = {
  title: "Artikel Baru",
  robots: { index: false, follow: false },
};

export default async function NewArticlePage() {
  await requireAdmin();

  const [categories, tags] = await Promise.all([
    new BlogCategoryRepository().list(),
    new TagRepository().list(),
  ]);

  return <ArticleForm categories={categories} tags={tags} />;
}

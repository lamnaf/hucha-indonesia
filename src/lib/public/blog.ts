import { ArticleRepository } from "@/domain/articles/article.repository";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import type { MockArticle } from "@/lib/mock/blog";

export interface PublicBlogCategory {
  name: string;
  slug: string;
}

type PublicArticle = Awaited<
  ReturnType<ArticleRepository["listPublished"]>
>["items"][number];

/** Strips tags/entities so reading time is measured on visible words. */
function plainText(body: string): string {
  return body
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Approximate reading time in minutes (~200 words/min, min 1 minute). The
 * DB stores the article body (plain text or HTML from the rich editor), so
 * the read time is derived at render.
 */
function estimateReadingMinutes(body: string): number {
  const words = plainText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function toMockArticle(article: PublicArticle): MockArticle {
  return {
    title: article.title,
    slug: article.slug,
    category: article.blogCategory.name,
    categorySlug: article.blogCategory.slug,
    tags: article.tags.map((link) => link.tag.name),
    excerpt: article.excerpt ?? "",
    body: sanitizeRichText(article.body ?? ""),
    publishedAt: article.publishedAt
      ? article.publishedAt.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    readingMinutes: estimateReadingMinutes(article.body ?? ""),
  };
}

export async function getBlogCategories(): Promise<PublicBlogCategory[]> {
  const categories = await new BlogCategoryRepository().list();
  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
  }));
}

export async function getArticlesNewestFirst(): Promise<MockArticle[]> {
  const { items } = await new ArticleRepository().listPublished({
    pageSize: 100,
  });
  return items.map(toMockArticle);
}

export async function getArticleBySlug(
  slug: string
): Promise<MockArticle | undefined> {
  const article = await new ArticleRepository().findBySlug(slug);
  return article ? toMockArticle(article) : undefined;
}

export async function getArticlesByCategory(
  categorySlug: string
): Promise<MockArticle[]> {
  const { items } = await new ArticleRepository().listPublished({
    category: categorySlug,
    pageSize: 100,
  });
  return items.map(toMockArticle);
}

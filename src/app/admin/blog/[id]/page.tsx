import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { ArticleRepository } from "@/domain/articles/article.repository";
import { BlogCategoryRepository } from "@/domain/articles/blog-category.repository";
import { TagRepository } from "@/domain/articles/tag.repository";
import { NotFoundError } from "@/domain/errors";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = {
  title: "Edit Artikel",
  robots: { index: false, follow: false },
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    throw new NotFoundError("Artikel tidak ditemukan");
  }

  const article = await new ArticleRepository().findById(articleId);
  if (!article) {
    throw new NotFoundError(`Artikel #${articleId} tidak ditemukan`);
  }

  const [categories, tags] = await Promise.all([
    new BlogCategoryRepository().list(),
    new TagRepository().list(),
  ]);

  return (
    <ArticleForm
      categories={categories}
      tags={tags}
      initialFeaturedMediaUrl={article.featuredMedia?.filePath ?? null}
      initialOgImageUrl={article.seoMeta?.ogImage?.filePath ?? null}
      initial={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        blogCategoryId: article.blogCategoryId,
        featuredMediaId: article.featuredMediaId,
        excerpt: article.excerpt,
        body: article.body,
        status: article.status,
        publishedAt: article.publishedAt
          ? article.publishedAt.toISOString()
          : null,
        tagIds: article.tags.map((articleTag) => articleTag.tagId),
        isFeatured: article.isFeatured,
        seo: article.seoMeta
          ? {
              metaTitle: article.seoMeta.metaTitle,
              metaDescription: article.seoMeta.metaDescription,
              slugOverride: article.seoMeta.slugOverride,
              ogImageMediaId: article.seoMeta.ogImageMediaId,
              ogTitle: article.seoMeta.ogTitle,
              ogDescription: article.seoMeta.ogDescription,
              twitterCard: article.seoMeta.twitterCard,
              robots: article.seoMeta.robots,
              keywords: article.seoMeta.keywords,
              canonicalUrl: article.seoMeta.canonicalUrl,
            }
          : undefined,
      }}
    />
  );
}

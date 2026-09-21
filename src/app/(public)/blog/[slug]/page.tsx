import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";
import {
  getArticleBySlug,
  getArticlesNewestFirst,
} from "@/lib/public/blog";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCard } from "@/components/article-card";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/breadcrumb";

interface ArticleDetailProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticleDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return {};
  }
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
  });
}

export default async function ArticleDetail({ params }: ArticleDetailProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const related = (await getArticlesNewestFirst())
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    articleSection: article.category,
    keywords: article.tags.join(", "),
    author: {
      "@type": "Organization",
      name: "HuCha Indonesia",
    },
    publisher: {
      "@type": "Organization",
      name: "HuCha Indonesia",
    },
  };

  return (
    <>
      <section className="border-b py-12 sm:py-16">
        <div className="container mx-auto max-w-3xl space-y-6">
          <Breadcrumb
            items={[
              { label: "Blog", href: "/blog" },
              {
                label: article.category,
                href: `/blog/kategori/${article.categorySlug}`,
              },
              { label: article.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/blog/kategori/${article.categorySlug}`}>
              <Badge variant="secondary">{article.category}</Badge>
            </Link>
            <span className="text-muted-foreground text-xs">
              {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-muted-foreground text-xs">
              · {article.readingMinutes} menit baca
            </span>
          </div>
          <h1 className="text-balance text-3xl sm:text-4xl">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-12 sm:py-16">
        <div className="container mx-auto max-w-3xl space-y-8">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-video w-full rounded-lg object-cover"
            />
          ) : (
            <MediaPlaceholder label={article.title} />
          )}
          <div
            className="space-y-5 text-pretty break-words text-base leading-relaxed [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-primary [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline [&_pre]:overflow-x-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
              <SectionHeading
                title="Artikel Lainnya"
            title="Baca Juga"
            link={{ label: "Semua artikel", href: "/blog" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={articleJsonLd} />
    </>
  );
}

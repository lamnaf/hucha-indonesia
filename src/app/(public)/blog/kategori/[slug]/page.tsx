import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";
import {
  getArticlesByCategory,
  getBlogCategories,
} from "@/lib/public/blog";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumb } from "@/components/breadcrumb";

interface BlogCategoryProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogCategoryProps): Promise<Metadata> {
  const { slug } = await params;
  const blogCategories = await getBlogCategories();
  const category = blogCategories.find((item) => item.slug === slug);
  if (!category) {
    return {};
  }
  return pageMetadata({
    title: `${category.name} — Blog`,
    description: `Kumpulan artikel kategori ${category.name} dari HuCha Indonesia.`,
    path: `/blog/kategori/${category.slug}`,
  });
}

export default async function BlogCategory({ params }: BlogCategoryProps) {
  const { slug } = await params;
  const [blogCategories, categoryArticles] = await Promise.all([
    getBlogCategories(),
    getArticlesByCategory(slug),
  ]);
  const category = blogCategories.find((item) => item.slug === slug);
  if (!category) {
    notFound();
  }

  return (
    <>
      <section className="border-b py-12 sm:py-16">
        <div className="container space-y-4">
          <Breadcrumb
            items={[{ label: "Blog", href: "/blog" }, { label: category.name }]}
          />
          <h1 className="text-3xl sm:text-4xl">
            {category.name}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {categoryArticles.length} artikel pada kategori ini.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-12 sm:py-16">
        <div className="container">
          {categoryArticles.length === 0 ? (
            <EmptyState
              title="Belum ada artikel"
              description="Artikel pada kategori ini akan segera hadir. Coba kategori lain."
              action={
                <Button asChild variant="outline">
                  <Link href="/blog">Lihat Semua Artikel</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Kategori Lainnya"
            title="Jelajahi Kategori"
          />
          <div className="flex flex-wrap gap-2">
            {blogCategories
              .filter((item) => item.slug !== slug)
              .map((item) => (
                <Button asChild key={item.slug} variant="outline">
                  <Link href={`/blog/kategori/${item.slug}`}>{item.name}</Link>
                </Button>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";

import { pageMetadata } from "@/lib/seo";
import {
  getArticlesNewestFirst,
  getBlogCategories,
} from "@/lib/public/blog";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCard } from "@/components/article-card";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Artikel edukatif seputar perawatan motor, pemilihan cairan otomotif, serta berita terbaru dari HuCha Indonesia.",
  path: "/blog",
});

export default async function Blog() {
  const [blogCategories, articles] = await Promise.all([
    getBlogCategories(),
    getArticlesNewestFirst(),
  ]);

  return (
    <>
      <Hero
        align="center"
        badge="Blog"
        title="Tips, Panduan & Berita Otomotif"
        description="Kumpulan artikel untuk membantu Anda merawat motor lebih baik, ditulis oleh tim HuCha Indonesia."
      />

      <section className="border-t bg-muted/40 py-12 sm:py-16">
        <div className="container">
          <SectionHeading
            eyebrow="Kategori"
            title="Jelajahi Berdasarkan Kategori"
            align="center"
          />
          <div className="flex flex-wrap justify-center gap-2">
            {blogCategories.map((category) => (
              <Button asChild key={category.slug} variant="outline">
                <Link href={`/blog/kategori/${category.slug}`}>
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading eyebrow="Semua Artikel" title="Artikel Terbaru" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

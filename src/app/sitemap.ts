import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

import { getBlogCategories, getArticlesNewestFirst } from "@/lib/public/blog";
import { getPublicJobs } from "@/lib/public/jobs";
import { getPublicProducts } from "@/lib/public/products";
import { absoluteUrl } from "@/lib/seo";

/**
 * sitemap.xml (blueprint §25/§27/§35): only indexable public routes. Admin
 * routes are excluded here and via robots.txt (§8). Public content is read
 * from the published CMS rows so the sitemap stays in sync with the site.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/tentang-kami",
    "/merek-kami",
    "/produk",
    "/kemitraan",
    "/oem",
    "/karir",
    "/blog",
    "/testimoni",
    "/faq",
    "/kontak",
    "/kebijakan-privasi",
    "/syarat-ketentuan",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];
  let jobRoutes: MetadataRoute.Sitemap = [];

  try {
    const [products, blogCategories, articles, jobs] = await Promise.all([
      getPublicProducts(),
      getBlogCategories(),
      getArticlesNewestFirst(),
      getPublicJobs(),
    ]);

    productRoutes = products.map((product) => ({
      url: absoluteUrl(`/produk/${product.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    categoryRoutes = blogCategories.map((category) => ({
      url: absoluteUrl(`/blog/kategori/${category.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    articleRoutes = articles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    jobRoutes = jobs.map((job) => ({
      url: absoluteUrl(`/karir/${job.slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // DB unreachable — return only static routes
  }

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...jobRoutes,
  ];
}

import {
  PrismaClient,
  SeoEntityType,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export interface SeoMetaInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  slugOverride?: string | null;
  ogImageMediaId?: number | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  twitterCard?: string | null;
  robots?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
}

export interface SeoAuditItem {
  entityType: SeoEntityType;
  entityId: number;
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  issues: string[];
}

export class SeoMetaRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  findByEntity(entityType: SeoEntityType, entityId: number) {
    return this.client.seoMeta.findFirst({
      where: { entityType, entityId },
    });
  }

  async upsert(
    entityType: SeoEntityType,
    entityId: number,
    input: SeoMetaInput
  ) {
    const existing = await this.client.seoMeta.findFirst({
      where: { entityType, entityId },
    });
    if (existing) {
      return this.client.seoMeta.update({
        where: { id: existing.id },
        data: input,
      });
    }
    return this.client.seoMeta.create({
      data: { entityType, entityId, ...input },
    });
  }

  /**
   * SEO audit: published entities whose meta title/description are missing
   * or outside recommended length (title >60, description >155) — flagged,
   * not blocked (blueprint §27).
   */
  async listAuditCandidates() {
    const [products, articles, metas] = await Promise.all([
      this.client.product.findMany({
        where: { status: "published", deletedAt: null },
        select: { id: true, name: true, slug: true },
      }),
      this.client.article.findMany({
        where: { status: "published", deletedAt: null },
        select: { id: true, title: true, slug: true },
      }),
      this.client.seoMeta.findMany(),
    ]);

    const byEntity = new Map<string, Map<number, (typeof metas)[number]>>();
    for (const meta of metas) {
      const key = meta.entityType;
      if (!byEntity.has(key)) byEntity.set(key, new Map());
      byEntity.get(key)!.set(meta.entityId, meta);
    }

    const audit: SeoAuditItem[] = [];

    for (const product of products) {
      const meta = byEntity.get("product")?.get(product.id);
      audit.push(
        this.evaluate(
          SeoEntityType.product,
          product.id,
          product.name,
          product.slug,
          meta
        )
      );
    }
    for (const article of articles) {
      const meta = byEntity.get("article")?.get(article.id);
      audit.push(
        this.evaluate(
          SeoEntityType.article,
          article.id,
          article.title,
          article.slug,
          meta
        )
      );
    }

    return audit;
  }

  private evaluate(
    entityType: SeoEntityType,
    entityId: number,
    title: string,
    slug: string,
    meta:
      | {
          metaTitle: string | null;
          metaDescription: string | null;
          ogImageMediaId: number | null;
          keywords: string | null;
          ogTitle: string | null;
          ogDescription: string | null;
        }
      | undefined
  ): SeoAuditItem {
    const issues: string[] = [];
    const metaTitle = meta?.metaTitle ?? null;
    const metaDescription = meta?.metaDescription ?? null;

    if (!metaTitle) issues.push("missing meta_title");
    else if (metaTitle.length > 60) issues.push("meta_title too long");
    if (!metaDescription) issues.push("missing meta_description");
    else if (metaDescription.length > 155)
      issues.push("meta_description too long");
    if (!meta?.ogImageMediaId) issues.push("missing og image");
    if (!meta?.ogTitle) issues.push("missing og_title");
    if (!meta?.ogDescription) issues.push("missing og_description");
    if (!meta?.keywords || meta.keywords.length === 0)
      issues.push("missing keywords");

    return {
      entityType,
      entityId,
      title,
      slug,
      metaTitle,
      metaDescription,
      issues,
    };
  }
}

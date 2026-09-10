import {
  PrismaClient,
  Prisma,
  ArticleStatus,
  SeoEntityType,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface ArticleListOptions {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export type ArticleSort = "newest" | "oldest" | "title" | "updated";

export interface ArticleInput {
  title: string;
  slug?: string;
  blogCategoryId: number;
  authorId: number;
  featuredMediaId?: number | null;
  excerpt?: string | null;
  body?: string | null;
  status?: ArticleStatus;
  isFeatured?: boolean;
  publishedAt?: Date | string | null;
  tagIds?: number[];
  seo?: {
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
  } | null;
}

/**
 * Article updates never change authorship — the author is bound at creation.
 */
export type ArticleUpdateInput = Omit<ArticleInput, "authorId">;

const PUBLISHED_INCLUDE = {
  blogCategory: true,
  featuredMedia: true,
  author: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
};

export class ArticleRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async listPublished(options: ArticleListOptions) {
    const { category, tag, page = 1, pageSize = 20 } = options;
    const where: Prisma.ArticleWhereInput = {
      status: "published",
      deletedAt: null,
      publishedAt: { not: null },
    };

    if (category) {
      where.blogCategory = { slug: category };
    }
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }
    if (options.featured) {
      where.isFeatured = true;
    }
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { excerpt: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.article.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: PUBLISHED_INCLUDE,
      }),
      this.client.article.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findBySlug(slug: string) {
    return this.client.article.findFirst({
      where: {
        slug,
        status: "published",
        deletedAt: null,
        publishedAt: { not: null },
      },
      include: PUBLISHED_INCLUDE,
    });
  }

  async findById(id: number) {
    const article = await this.client.article.findUnique({
      where: { id },
      include: PUBLISHED_INCLUDE,
    });
    if (!article) return null;

    const seoMeta = await this.client.seoMeta.findFirst({
      where: { entityType: SeoEntityType.article, entityId: id },
      include: { ogImage: true },
    });
    return { ...article, seoMeta };
  }

  async listAdmin(
    options: ArticleListOptions & { status?: ArticleStatus; sort?: ArticleSort } =
      {}
  ) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.ArticleWhereInput = { deletedAt: null };
    if (options.status) where.status = options.status;
    if (options.featured) where.isFeatured = true;
    if (options.category) {
      where.blogCategory = { slug: options.category };
    }
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput =
      options.sort === "oldest"
        ? { id: "asc" }
        : options.sort === "title"
          ? { title: "asc" }
          : options.sort === "updated"
            ? { publishedAt: "desc" }
            : { id: "desc" };

    const [items, total] = await Promise.all([
      this.client.article.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          blogCategory: true,
          author: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.client.article.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async create(input: ArticleInput) {
    const slug = input.slug ?? slugify(input.title);
    const { tagIds = [], seo, ...data } = input;

    return runMapped(
      () =>
        this.client.$transaction(async (tx) => {
          const article = await tx.article.create({
            data: {
              ...data,
              slug,
              publishedAt: input.publishedAt
                ? new Date(input.publishedAt)
                : input.status === "published"
                  ? new Date()
                  : null,
              tags:
                tagIds.length > 0
                  ? { create: tagIds.map((tagId) => ({ tagId })) }
                  : undefined,
            },
          });

          if (seo) {
            await tx.seoMeta.create({
              data: {
                entityType: SeoEntityType.article,
                entityId: article.id,
                ...seo,
              },
            });
          }

          return article;
        }),
      { conflict: `Slug artikel "${slug}" sudah digunakan` }
    );
  }

  async update(id: number, input: ArticleUpdateInput) {
    const { tagIds, seo, publishedAt, ...data } = input;

    return runMapped(
      () =>
        this.client.$transaction(async (tx) => {
          const article = await tx.article.update({
            where: { id },
            data: {
              ...data,
              publishedAt:
                publishedAt === undefined
                  ? undefined
                  : publishedAt === null
                    ? null
                    : new Date(publishedAt),
              tags:
                tagIds !== undefined
                  ? {
                      deleteMany: {},
                      create: tagIds.map((tagId) => ({ tagId })),
                    }
                  : undefined,
            },
          });

          if (seo) {
            const existing = await tx.seoMeta.findFirst({
              where: { entityType: SeoEntityType.article, entityId: id },
            });
            if (existing) {
              await tx.seoMeta.update({
                where: { id: existing.id },
                data: seo,
              });
            } else {
              await tx.seoMeta.create({
                data: {
                  entityType: SeoEntityType.article,
                  entityId: id,
                  ...seo,
                },
              });
            }
          }

          return article;
        }),
      {
        conflict: "Slug artikel sudah digunakan",
        notFound: `Artikel #${id} tidak ditemukan`,
      }
    );
  }

  async publish(id: number, publishedAt: Date = new Date()) {
    return runMapped(
      () =>
        this.client.article.update({
          where: { id },
          data: { status: "published", publishedAt },
        }),
      { notFound: `Artikel #${id} tidak ditemukan` }
    );
  }

  async softDelete(id: number) {
    return runMapped(
      () =>
        this.client.article.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      { notFound: `Artikel #${id} tidak ditemukan` }
    );
  }

  async restore(id: number) {
    return runMapped(
      () =>
        this.client.article.update({
          where: { id },
          data: { deletedAt: null },
        }),
      { notFound: `Artikel #${id} tidak ditemukan` }
    );
  }

  async setFeatured(id: number, isFeatured: boolean) {
    return runMapped(
      () => this.client.article.update({ where: { id }, data: { isFeatured } }),
      { notFound: `Artikel #${id} tidak ditemukan` }
    );
  }

  /** Maps article slugs to their titles for the top-articles snapshot (§28). */
  async findTitlesBySlugs(slugs: ReadonlySet<string>) {
    const list = [...slugs];
    if (list.length === 0) {
      return new Map<string, string>();
    }
    const rows = await this.client.article.findMany({
      where: { slug: { in: list } },
      select: { slug: true, title: true },
    });
    return new Map(rows.map((row) => [row.slug, row.title]));
  }

  countByStatus() {
    return this.client.article.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { deletedAt: null },
    });
  }

  countAll() {
    return this.client.article.count({ where: { deletedAt: null } });
  }

  /**
   * Counts published articles per calendar month (grouped by `published_at`),
   * last `months` months oldest-first. Returns `{ label, value }[]` with
   * `YYYY-MM` labels.
   */
  async countPublishedByMonth(
    months = 6
  ): Promise<{ label: string; value: number }[]> {
    const since = new Date();
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    since.setMonth(since.getMonth() - (months - 1));

    const rows = await this.client.article.groupBy({
      by: ["publishedAt"],
      _count: { _all: true },
      where: {
        status: "published",
        deletedAt: null,
        publishedAt: { not: null, gte: since },
      },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      if (!row.publishedAt) continue;
      const d = row.publishedAt;
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts.set(label, (counts.get(label) ?? 0) + row._count._all);
    }

    const labels: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      labels.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
    }

    return labels.map((label) => ({ label, value: counts.get(label) ?? 0 }));
  }

  /**
   * Copies an article into a new draft row (same category/tags/SEO, new
   * slug). Uses a transaction so the clone is atomic (§25 duplicate).
   */
  async duplicate(id: number) {
    const source = await this.findById(id);
    if (!source) return null;

    const baseSlug = `${source.slug}-salinan`;
    let slug = baseSlug;
    let suffix = 2;
    while (
      await this.client.article.findUnique({ where: { slug }, select: { id: true } })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return runMapped(
      () =>
        this.client.$transaction(async (tx) => {
          const copy = await tx.article.create({
            data: {
              title: `${source.title} (Salinan)`,
              slug,
              blogCategoryId: source.blogCategoryId,
              featuredMediaId: source.featuredMediaId,
              excerpt: source.excerpt,
              body: source.body,
              status: "draft",
              isFeatured: false,
              publishedAt: null,
              authorId: source.authorId,
              tags:
                source.tags.length > 0
                  ? { create: source.tags.map((t) => ({ tagId: t.tagId })) }
                  : undefined,
            },
          });
          if (source.seoMeta) {
            await tx.seoMeta.create({
              data: {
                entityType: SeoEntityType.article,
                entityId: copy.id,
                metaTitle: source.seoMeta.metaTitle,
                metaDescription: source.seoMeta.metaDescription,
                slugOverride: source.seoMeta.slugOverride,
                ogImageMediaId: source.seoMeta.ogImageMediaId,
                ogTitle: source.seoMeta.ogTitle,
                ogDescription: source.seoMeta.ogDescription,
                twitterCard: source.seoMeta.twitterCard,
                robots: source.seoMeta.robots,
                keywords: source.seoMeta.keywords,
                canonicalUrl: source.seoMeta.canonicalUrl,
              },
            });
          }
          return copy;
        }),
      { conflict: "Slug artikel salinan sudah digunakan" }
    );
  }
}

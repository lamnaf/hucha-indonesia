import {
  PrismaClient,
  Prisma,
  ProductStatus,
  SeoEntityType,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface ProductListOptions {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductAdminListOptions extends ProductListOptions {
  status?: ProductStatus;
  brandId?: number;
}

export interface ProductInput {
  name: string;
  slug?: string;
  categoryId: number;
  subCategoryId?: number | null;
  brandId?: number | null;
  shortDescription?: string | null;
  description?: string | null;
  tiktokshopUrl?: string | null;
  isFeatured?: boolean;
  status?: ProductStatus;
  images?: number[];
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    slugOverride?: string | null;
    ogImageMediaId?: number | null;
    canonicalUrl?: string | null;
  } | null;
}

const PUBLISHED_INCLUDE = {
  category: true,
  subCategory: true,
  brand: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    include: { media: true },
  },
};

export class ProductRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  private buildListWhere(
    options: ProductListOptions
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      status: "published",
      deletedAt: null,
    };

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { shortDescription: { contains: options.search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async listPublished(options: ProductListOptions) {
    const { category, page = 1, pageSize = 20 } = options;
    const where = this.buildListWhere(options);

    if (category) {
      const categoryRecord = await this.client.category.findUnique({
        where: { slug: category },
      });
      if (!categoryRecord) {
        return { items: [], total: 0, page, pageSize };
      }
      if (categoryRecord.parentId === null) {
        where.categoryId = categoryRecord.id;
      } else {
        where.subCategoryId = categoryRecord.id;
      }
    }

    const [items, total] = await Promise.all([
      this.client.product.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: PUBLISHED_INCLUDE,
      }),
      this.client.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async countPublished() {
    return this.client.product.count({
      where: { status: "published", deletedAt: null },
    });
  }

  async findBySlug(slug: string) {
    return this.client.product.findFirst({
      where: { slug, status: "published", deletedAt: null },
      include: PUBLISHED_INCLUDE,
    });
  }

  async findById(id: number) {
    return this.client.product.findUnique({
      where: { id },
      include: PUBLISHED_INCLUDE,
    });
  }

  async listAdmin(options: ProductAdminListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (options.status) where.status = options.status;
    if (options.brandId) where.brandId = options.brandId;
    if (options.category) {
      const categoryRecord = await this.client.category.findUnique({
        where: { slug: options.category },
      });
      if (!categoryRecord) {
        return { items: [], total: 0, page, pageSize };
      }
      if (categoryRecord.parentId === null) {
        where.categoryId = categoryRecord.id;
      } else {
        where.subCategoryId = categoryRecord.id;
      }
    }
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.product.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          subCategory: true,
          brand: true,
          images: { orderBy: { sortOrder: "asc" }, include: { media: true } },
        },
      }),
      this.client.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async create(input: ProductInput) {
    const slug = input.slug ?? slugify(input.name);
    const { images = [], seo, ...data } = input;

    return runMapped(
      () =>
        this.client.$transaction(async (tx) => {
          const product = await tx.product.create({
            data: { ...data, slug },
          });

          if (images.length > 0) {
            await tx.productImage.createMany({
              data: images.map((mediaId, index) => ({
                productId: product.id,
                mediaId,
                sortOrder: index,
              })),
            });
          }

          if (seo) {
            await tx.seoMeta.create({
              data: {
                entityType: SeoEntityType.product,
                entityId: product.id,
                ...seo,
              },
            });
          }

          return product;
        }),
      { conflict: `Slug produk "${slug}" sudah digunakan` }
    );
  }

  async update(id: number, input: ProductInput) {
    const { images, seo, ...data } = input;

    return runMapped(
      () =>
        this.client.$transaction(async (tx) => {
          const product = await tx.product.update({
            where: { id },
            data,
          });

          if (images) {
            await tx.productImage.deleteMany({ where: { productId: id } });
            if (images.length > 0) {
              await tx.productImage.createMany({
                data: images.map((mediaId, index) => ({
                  productId: id,
                  mediaId,
                  sortOrder: index,
                })),
              });
            }
          }

          if (seo) {
            const existing = await tx.seoMeta.findFirst({
              where: { entityType: SeoEntityType.product, entityId: id },
            });
            if (existing) {
              await tx.seoMeta.update({
                where: { id: existing.id },
                data: seo,
              });
            } else {
              await tx.seoMeta.create({
                data: {
                  entityType: SeoEntityType.product,
                  entityId: id,
                  ...seo,
                },
              });
            }
          }

          return product;
        }),
      {
        conflict: "Slug produk sudah digunakan",
        notFound: `Produk #${id} tidak ditemukan`,
      }
    );
  }

  async softDelete(id: number) {
    return runMapped(
      () =>
        this.client.product.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      { notFound: `Produk #${id} tidak ditemukan` }
    );
  }

  async restore(id: number) {
    return runMapped(
      () =>
        this.client.product.update({
          where: { id },
          data: { deletedAt: null },
        }),
      { notFound: `Produk #${id} tidak ditemukan` }
    );
  }

  async setFeatured(id: number, isFeatured: boolean) {
    return runMapped(
      () => this.client.product.update({ where: { id }, data: { isFeatured } }),
      { notFound: `Produk #${id} tidak ditemukan` }
    );
  }
}

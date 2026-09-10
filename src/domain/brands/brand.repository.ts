import {
  PrismaClient,
  Prisma,
  CategoryType,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface BrandInput {
  name: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  category: CategoryType;
  logoMediaId?: number | null;
  highlights?: string[];
  sortOrder?: number;
  isPublished?: boolean;
}

export interface BrandListOptions {
  category?: CategoryType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export class BrandRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  private buildListWhere(options: BrandListOptions): Prisma.BrandWhereInput {
    const where: Prisma.BrandWhereInput = { deletedAt: null };
    if (options.category) where.category = options.category;
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  async list(options: BrandListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where = this.buildListWhere(options);

    const [items, total] = await Promise.all([
      this.client.brand.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          logo: true,
          _count: { select: { products: true } },
        },
      }),
      this.client.brand.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  listPublished() {
    return this.client.brand.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { logo: true },
    });
  }

  findById(id: number) {
    return this.client.brand.findUnique({
      where: { id },
      include: { logo: true },
    });
  }

  findBySlug(slug: string) {
    return this.client.brand.findUnique({ where: { slug } });
  }

  async create(input: BrandInput) {
    const { highlights, ...data } = input;
    const slug = input.slug ?? slugify(input.name);
    return runMapped(
      () =>
        this.client.brand.create({
          data: {
            ...data,
            slug,
            highlights:
              highlights !== undefined && highlights.length > 0
                ? highlights
                : undefined,
          },
        }),
      { conflict: `Slug merek "${slug}" sudah digunakan` }
    );
  }

  async update(id: number, input: Partial<BrandInput>) {
    const { highlights, ...data } = input;
    return runMapped(
      () =>
        this.client.brand.update({
          where: { id },
          data: {
            ...data,
            ...(highlights !== undefined
              ? {
                  highlights:
                    highlights.length > 0 ? highlights : Prisma.DbNull,
                }
              : {}),
          },
        }),
      {
        conflict: "Slug merek sudah digunakan",
        notFound: `Merek #${id} tidak ditemukan`,
      }
    );
  }

  async softDelete(id: number) {
    return runMapped(
      () =>
        this.client.brand.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      { notFound: `Merek #${id} tidak ditemukan` }
    );
  }
}

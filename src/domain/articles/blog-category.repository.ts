import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface BlogCategoryInput {
  name: string;
  slug?: string;
}

export interface BlogCategoryListOptions {
  search?: string;
  page?: number;
  pageSize?: number;
}

export class BlogCategoryRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  list() {
    return this.client.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
  }

  findBySlug(slug: string) {
    return this.client.blogCategory.findUnique({ where: { slug } });
  }

  findById(id: number) {
    return this.client.blogCategory.findUnique({ where: { id } });
  }

  async create(input: BlogCategoryInput) {
    const slug = input.slug ?? slugify(input.name);
    return runMapped(
      () =>
        this.client.blogCategory.create({ data: { name: input.name, slug } }),
      { conflict: `Slug kategori blog "${slug}" sudah digunakan` }
    );
  }

  async update(id: number, input: Partial<BlogCategoryInput>) {
    const data: { name?: string; slug?: string } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    return runMapped(
      () => this.client.blogCategory.update({ where: { id }, data }),
      {
        conflict: "Slug kategori blog sudah digunakan",
        notFound: `Kategori blog #${id} tidak ditemukan`,
      }
    );
  }

  async listAdmin(options: BlogCategoryListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.BlogCategoryWhereInput = options.search
      ? { name: { contains: options.search, mode: "insensitive" } }
      : {};

    const [items, total] = await Promise.all([
      this.client.blogCategory.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { articles: true } } },
      }),
      this.client.blogCategory.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async delete(id: number) {
    return runMapped(
      () => this.client.blogCategory.delete({ where: { id } }),
      {
        notFound: `Kategori blog #${id} tidak ditemukan`,
        conflict:
          "Kategori blog masih memiliki artikel dan tidak dapat dihapus",
      }
    );
  }
}

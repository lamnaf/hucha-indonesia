import {
  PrismaClient,
  Prisma,
  CategoryType,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface CategoryInput {
  name: string;
  slug?: string;
  type: CategoryType;
  parentId?: number | null;
}

export interface CategoryListOptions {
  search?: string;
  type?: CategoryType;
  page?: number;
  pageSize?: number;
}

export class CategoryRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  listTopLevel() {
    return this.client.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" } } },
    });
  }

  listByType(type: CategoryType) {
    return this.client.category.findMany({
      where: { type, parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" } } },
    });
  }

  findById(id: number) {
    return this.client.category.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.client.category.findUnique({
      where: { slug },
      include: { children: true },
    });
  }

  async create(input: CategoryInput) {
    const { parentId, ...rest } = input;
    const slug = input.slug ?? slugify(input.name);
    return runMapped(
      () =>
        this.client.category.create({
          data: { ...rest, slug, parentId: parentId ?? null },
        }),
      { conflict: `Slug kategori "${slug}" sudah digunakan` }
    );
  }

  async update(id: number, input: Partial<CategoryInput>) {
    const data: {
      name?: string;
      slug?: string;
      type?: CategoryType;
      parentId?: number | null;
    } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.type !== undefined) data.type = input.type;
    if (input.parentId !== undefined) data.parentId = input.parentId;
    return runMapped(
      () => this.client.category.update({ where: { id }, data }),
      {
        conflict: "Slug kategori sudah digunakan",
        notFound: `Kategori #${id} tidak ditemukan`,
      }
    );
  }

  async listAdmin(options: CategoryListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.CategoryWhereInput = {};
    if (options.type) where.type = options.type;
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.category.findMany({
        where,
        orderBy: [{ type: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          parent: true,
          _count: { select: { products: true, children: true } },
        },
      }),
      this.client.category.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async delete(id: number) {
    return runMapped(() => this.client.category.delete({ where: { id } }), {
      notFound: `Kategori #${id} tidak ditemukan`,
      conflict:
        "Kategori masih memiliki produk atau sub-kategori dan tidak dapat dihapus",
    });
  }
}

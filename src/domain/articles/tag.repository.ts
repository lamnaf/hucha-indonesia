import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface TagInput {
  name: string;
  slug?: string;
}

export interface TagListOptions {
  search?: string;
  page?: number;
  pageSize?: number;
}

export class TagRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  list() {
    return this.client.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
  }

  findBySlug(slug: string) {
    return this.client.tag.findUnique({ where: { slug } });
  }

  findByIds(ids: number[]) {
    return this.client.tag.findMany({ where: { id: { in: ids } } });
  }

  async create(input: TagInput) {
    const slug = input.slug ?? slugify(input.name);
    return runMapped(
      () => this.client.tag.create({ data: { name: input.name, slug } }),
      { conflict: `Slug tag "${slug}" sudah digunakan` }
    );
  }

  /**
   * Creates the tag if it does not exist, otherwise returns the existing row.
   */
  async findOrCreateByName(name: string) {
    const slug = slugify(name);
    return this.client.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  async listAdmin(options: TagListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.TagWhereInput = options.search
      ? { name: { contains: options.search, mode: "insensitive" } }
      : {};

    const [items, total] = await Promise.all([
      this.client.tag.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { articles: true } } },
      }),
      this.client.tag.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async update(id: number, input: Partial<TagInput>) {
    const data: { name?: string; slug?: string } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    return runMapped(
      () => this.client.tag.update({ where: { id }, data }),
      {
        conflict: "Slug tag sudah digunakan",
        notFound: `Tag #${id} tidak ditemukan`,
      }
    );
  }

  async delete(id: number) {
    return runMapped(
      () => this.client.tag.delete({ where: { id } }),
      {
        notFound: `Tag #${id} tidak ditemukan`,
        conflict: "Tag masih digunakan oleh artikel dan tidak dapat dihapus",
      }
    );
  }
}

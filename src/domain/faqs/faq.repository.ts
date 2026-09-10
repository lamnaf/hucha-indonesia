import { Prisma, PrismaClient } from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface FaqInput {
  faqCategoryId: number;
  question: string;
  answer: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface FaqCategoryInput {
  name: string;
  slug?: string;
}

export interface FaqListOptions {
  search?: string;
  published?: boolean;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export class FaqRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  listPublished() {
    return this.client.faq.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { faqCategory: true },
    });
  }

  listCategories() {
    return this.client.faqCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { faqs: true } } },
    });
  }

  async listAdmin(options: FaqListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.FaqWhereInput = {};
    if (options.published !== undefined) where.isPublished = options.published;
    if (options.categoryId) where.faqCategoryId = options.categoryId;
    if (options.search) {
      where.OR = [
        { question: { contains: options.search, mode: "insensitive" } },
        { answer: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.faq.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { faqCategory: true },
      }),
      this.client.faq.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findById(id: number) {
    return this.client.faq.findUnique({
      where: { id },
      include: { faqCategory: true },
    });
  }

  findByCategorySlug(slug: string) {
    return this.client.faqCategory.findUnique({
      where: { slug },
      include: {
        faqs: {
          where: { isPublished: true },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
      },
    });
  }

  findCategoryById(id: number) {
    return this.client.faqCategory.findUnique({ where: { id } });
  }

  async createCategory(input: FaqCategoryInput) {
    const slug = input.slug ?? slugify(input.name);
    return runMapped(
      () =>
        this.client.faqCategory.create({ data: { name: input.name, slug } }),
      { conflict: `Slug kategori FAQ "${slug}" sudah digunakan` }
    );
  }

  async updateCategory(id: number, input: FaqCategoryInput) {
    const slug = input.slug ?? slugify(input.name);
    return runMapped(
      () => this.client.faqCategory.update({ where: { id }, data: { name: input.name, slug } }),
      {
        notFound: `Kategori FAQ #${id} tidak ditemukan`,
        conflict: `Slug kategori FAQ "${slug}" sudah digunakan`,
      }
    );
  }

  async deleteCategory(id: number) {
    return runMapped(
      () => this.client.faqCategory.delete({ where: { id } }),
      {
        notFound: `Kategori FAQ #${id} tidak ditemukan`,
        conflict: `Kategori masih berisi FAQ. Pindahkan atau hapus FAQ-nya terlebih dahulu.`,
      }
    );
  }

  async createFaq(input: FaqInput) {
    return runMapped(
      () => this.client.faq.create({ data: input }),
      { conflict: "Kategori FAQ yang dipilih tidak ditemukan" }
    );
  }

  async updateFaq(id: number, input: Partial<FaqInput>) {
    return runMapped(
      () => this.client.faq.update({ where: { id }, data: input }),
      { notFound: `FAQ #${id} tidak ditemukan` }
    );
  }

  async deleteFaq(id: number) {
    return runMapped(
      () => this.client.faq.delete({ where: { id } }),
      { notFound: `FAQ #${id} tidak ditemukan` }
    );
  }
}

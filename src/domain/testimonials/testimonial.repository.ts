import { Prisma, PrismaClient } from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";

export interface TestimonialInput {
  partnerName: string;
  partnerBusiness?: string | null;
  partnerRegion?: string | null;
  quote: string;
  partnerLogoMediaId?: number | null;
  rating?: number | null;
  isPublished?: boolean;
}

export interface TestimonialListOptions {
  search?: string;
  published?: boolean;
  page?: number;
  pageSize?: number;
}

export class TestimonialRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  listPublished() {
    return this.client.testimonial.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { id: "desc" },
      include: { partnerLogo: true },
    });
  }

  async listAdmin(options: TestimonialListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.TestimonialWhereInput = { deletedAt: null };
    if (options.published !== undefined) where.isPublished = options.published;
    if (options.search) {
      where.OR = [
        { partnerName: { contains: options.search, mode: "insensitive" } },
        { partnerBusiness: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.testimonial.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { partnerLogo: true },
      }),
      this.client.testimonial.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findById(id: number) {
    return this.client.testimonial.findUnique({
      where: { id },
      include: { partnerLogo: true },
    });
  }

  async create(input: TestimonialInput) {
    return runMapped(
      () => this.client.testimonial.create({ data: input }),
      { conflict: "Logo media yang dipilih tidak ditemukan" }
    );
  }

  async update(id: number, input: Partial<TestimonialInput>) {
    return runMapped(
      () => this.client.testimonial.update({ where: { id }, data: input }),
      { notFound: `Testimoni #${id} tidak ditemukan` }
    );
  }

  async setPublished(id: number, isPublished: boolean) {
    return runMapped(
      () => this.client.testimonial.update({ where: { id }, data: { isPublished } }),
      { notFound: `Testimoni #${id} tidak ditemukan` }
    );
  }

  async softDelete(id: number) {
    return runMapped(
      () =>
        this.client.testimonial.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      { notFound: `Testimoni #${id} tidak ditemukan` }
    );
  }
}

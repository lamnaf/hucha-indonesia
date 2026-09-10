import {
  PrismaClient,
  Prisma,
  JobStatus,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";
import { slugify } from "@/shared/utils/slug";

export interface JobInput {
  title: string;
  slug?: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  description?: string | null;
  requirements?: string | null;
  status?: JobStatus;
}

export interface JobListOptions {
  search?: string;
  status?: JobStatus;
  page?: number;
  pageSize?: number;
}

export class JobRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  listOpen() {
    return this.client.job.findMany({
      where: { status: "open", deletedAt: null },
      orderBy: [{ id: "desc" }],
    });
  }

  async listAdmin(options: JobListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.JobWhereInput = { deletedAt: null };
    if (options.status) where.status = options.status;
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.job.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { applications: true } } },
      }),
      this.client.job.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findById(id: number) {
    return this.client.job.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.client.job.findFirst({
      where: { slug, status: "open", deletedAt: null },
    });
  }

  async create(input: JobInput) {
    const slug = input.slug ?? slugify(input.title);
    return runMapped(
      () => this.client.job.create({ data: { ...input, slug } }),
      { conflict: `Slug lowongan "${slug}" sudah digunakan` }
    );
  }

  async update(id: number, input: Partial<JobInput>) {
    return runMapped(
      () => this.client.job.update({ where: { id }, data: input }),
      {
        conflict: "Slug lowongan sudah digunakan",
        notFound: `Lowongan #${id} tidak ditemukan`,
      }
    );
  }

  async setStatus(id: number, status: JobStatus) {
    return runMapped(
      () => this.client.job.update({ where: { id }, data: { status } }),
      { notFound: `Lowongan #${id} tidak ditemukan` }
    );
  }

  async softDelete(id: number) {
    return runMapped(
      () =>
        this.client.job.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      { notFound: `Lowongan #${id} tidak ditemukan` }
    );
  }

  async restore(id: number) {
    return runMapped(
      () =>
        this.client.job.update({
          where: { id },
          data: { deletedAt: null },
        }),
      { notFound: `Lowongan #${id} tidak ditemukan` }
    );
  }
}

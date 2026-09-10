import {
  PrismaClient,
  Prisma,
  ApplicationStatus,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";

export interface ApplicationInput {
  jobId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  cvMediaId: number;
  coverNote?: string | null;
}

export interface ApplicationListOptions {
  jobId?: number;
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export class ApplicationRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async create(input: ApplicationInput) {
    return this.client.application.create({ data: input });
  }

  findById(id: number) {
    return this.client.application.findUnique({
      where: { id },
      include: { job: true, cvMedia: true },
    });
  }

  async list(options: ApplicationListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.ApplicationWhereInput = {};
    if (options.jobId) where.jobId = options.jobId;
    if (options.status) where.status = options.status;
    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: "insensitive" } },
        { email: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { job: { select: { id: true, title: true } } },
      }),
      this.client.application.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  countPending() {
    return this.client.application.count({ where: { status: "new" } });
  }

  async updateStatus(id: number, status: ApplicationStatus) {
    return runMapped(
      () => this.client.application.update({ where: { id }, data: { status } }),
      { notFound: `Lamaran #${id} tidak ditemukan` }
    );
  }

  async delete(id: number) {
    return runMapped(
      () => this.client.application.delete({ where: { id } }),
      { notFound: `Lamaran #${id} tidak ditemukan` }
    );
  }
}

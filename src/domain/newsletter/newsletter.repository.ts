import { Prisma, PrismaClient } from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";

export interface NewsletterSubscriberInput {
  email: string;
  name?: string | null;
  source?: string | null;
}

export interface NewsletterSubscriberListOptions {
  search?: string;
  subscribed?: boolean;
  page?: number;
  pageSize?: number;
}

export class NewsletterSubscriberRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async subscribe(input: NewsletterSubscriberInput) {
    return runMapped(
      () =>
        this.client.newsletterSubscriber.upsert({
          where: { email: input.email.toLowerCase() },
          create: {
            email: input.email.toLowerCase(),
            name: input.name,
            source: input.source,
            isSubscribed: true,
          },
          update: { isSubscribed: true },
        }),
      {}
    );
  }

  async unsubscribeByEmail(email: string) {
    return runMapped(
      () =>
        this.client.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { isSubscribed: false },
        }),
      { notFound: "Email tidak terdaftar sebagai langganan" }
    );
  }

  async listAdmin(options: NewsletterSubscriberListOptions = {}) {
    const { page = 1, pageSize = 20 } = options;
    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (options.subscribed !== undefined) where.isSubscribed = options.subscribed;
    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: "insensitive" } },
        { name: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.client.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.client.newsletterSubscriber.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  countSubscribed() {
    return this.client.newsletterSubscriber.count({ where: { isSubscribed: true } });
  }

  async optOut(id: number) {
    return runMapped(
      () =>
        this.client.newsletterSubscriber.update({
          where: { id },
          data: { isSubscribed: false },
        }),
      { notFound: `Pelanggan #${id} tidak ditemukan` }
    );
  }

  async delete(id: number) {
    return runMapped(
      () => this.client.newsletterSubscriber.delete({ where: { id } }),
      { notFound: `Pelanggan #${id} tidak ditemukan` }
    );
  }
}

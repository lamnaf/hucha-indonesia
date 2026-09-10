import {
  PrismaClient,
  Prisma,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";
import { runMapped } from "@/domain/errors";

export interface UserListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export class UserRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  findByEmail(email: string) {
    return this.client.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.client.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput) {
    return runMapped(() => this.client.user.create({ data }), {
      conflict: "Email sudah terdaftar",
    });
  }

  /**
   * Creates an administrator account together with its Better Auth
   * `credential` account row (blueprint §16 accounts). Atomic — the user is
   * never left without a sign-in credential. `passwordHash` must be a
   * Better Auth-compatible hash (see `scripts/create-admin.ts`).
   */
  async createWithCredential(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return runMapped(
      () =>
        this.client.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: data.name,
              email: data.email,
              emailVerified: true,
              isAdmin: true,
              isActive: true,
            },
          });
          await tx.account.create({
            data: {
              userId: user.id,
              providerId: "credential",
              accountId: String(user.id),
              password: data.passwordHash,
            },
          });
          return user;
        }),
      { conflict: "Email sudah terdaftar" }
    );
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return runMapped(() => this.client.user.update({ where: { id }, data }), {
      notFound: `User #${id} tidak ditemukan`,
    });
  }

  async setActive(id: number, isActive: boolean) {
    return runMapped(
      () => this.client.user.update({ where: { id }, data: { isActive } }),
      { notFound: `User #${id} tidak ditemukan` }
    );
  }

  async touchLastLogin(id: number) {
    return runMapped(
      () =>
        this.client.user.update({
          where: { id },
          data: { lastLoginAt: new Date() },
        }),
      { notFound: `User #${id} tidak ditemukan` }
    );
  }

  countActive() {
    return this.client.user.count({ where: { isActive: true } });
  }

  async list({ page = 1, pageSize = 20, search }: UserListOptions = {}) {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.client.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.client.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
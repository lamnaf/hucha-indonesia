/**
 * Creates/updates the email+password credential for an existing seeded admin
 * (Better Auth stores credentials in the `accounts` table — blueprint §16).
 *
 * Usage:
 *   npm run db:seed                       # ensures admin@hucha.id exists
 *   npx tsx scripts/create-admin.ts admin@hucha.id '<strong-password>'
 *
 * Password must satisfy `passwordSchema` (min 10 chars, letter+number,
 * not on the common-password blocklist — blueprint §31).
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/infrastructure/database/prisma";
import { passwordSchema } from "@/shared/validation/common";

async function main() {
  const email = process.argv[2] ?? "admin@hucha.id";
  const password = process.argv[3];

  if (!password) {
    throw new Error(
      "Usage: npx tsx scripts/create-admin.ts <email> '<strong-password>'"
    );
  }

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    throw new Error(`Password ditolak: ${parsed.error.issues[0]?.message}`);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(
      `User "${email}" tidak ditemukan. Jalankan "npm run db:seed" terlebih dahulu.`
    );
  }
  if (!user.isActive) {
    throw new Error(`User "${email}" tidak aktif — aktifkan terlebih dahulu.`);
  }

  const passwordHash = await hashPassword(password);

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: String(user.id),
      },
    },
    update: { password: passwordHash },
    create: {
      userId: user.id,
      providerId: "credential",
      accountId: String(user.id),
      password: passwordHash,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  console.log(`Kredensial login ditetapkan untuk ${email} (user #${user.id}).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

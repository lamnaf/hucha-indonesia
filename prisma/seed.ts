import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Prisma,
} from "../src/infrastructure/database/generated/client";
import { passwordSchema } from "@/shared/validation/common";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to run the seed script. Set it in .env or the environment."
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

const categoryGroups = [
  {
    name: "Spareparts",
    slug: "spareparts",
    type: "spareparts",
    subcategories: ["Kampas Rem", "Busi", "Filter Udara", "Kampas Kopling"],
  },
  {
    name: "Cairan Otomotif",
    slug: "cairan-otomotif",
    type: "fluids",
    subcategories: ["Oli Mesin", "Oli Sokbreker", "Coolant"],
  },
  {
    name: "Perawatan Kendaraan",
    slug: "perawatan-kendaraan",
    type: "autocare",
    subcategories: ["Pembersih", "Pelindung", "Perawatan Rantai"],
  },
] as const;

const blogCategories = [
  "Tips Perawatan Motor",
  "Pemilihan Cairan",
  "Berita Perusahaan",
] as const;

const tags = [
  "Kampas Rem",
  "Oli Sokbreker",
  "Tips Perawatan",
  "Distributor",
  "Berita",
] as const;

const faqGroups = [
  {
    name: "Umum",
    slug: "umum",
    faqs: [
      {
        question: "Apakah HuCha Indonesia menerima pembelian grosir?",
        answer:
          "Ya. Kami melayani pembelian grosir untuk toko onderdil, bengkel, dan distributor di seluruh Indonesia. Silakan hubungi tim sales kami melalui formulir kemitraan atau WhatsApp.",
      },
      {
        question: "Bagaimana cara menjadi distributor HuCha?",
        answer:
          "Daftarkan data Anda melalui halaman Kemitraan. Tim kami akan menghubungi untuk verifikasi wilayah dan persyaratan minimal pembelian.",
      },
    ],
  },
  {
    name: "Produk",
    slug: "produk",
    faqs: [
      {
        question: "Apakah produk HuCha original?",
        answer:
          "Semua produk spareparts, cairan otomotif, dan perawatan kendaraan kami diproduksi melalui pabrik berstandar dan resmi dilindungi garansi.",
      },
      {
        question: "Di mana saya bisa membeli produk HuCha secara online?",
        answer:
          "Produk HuCha tersedia di toko resmi Tokopedia, Shopee, dan TikTok Shop. Cek link marketplace di halaman detail produk.",
      },
    ],
  },
  {
    name: "Kemitraan",
    slug: "kemitraan",
    faqs: [
      {
        question: "Apakah tersedia layanan maklon atau OEM?",
        answer:
          "Ya, kami melayani private label / maklon untuk produk cairan otomotif dan perawatan kendaraan. Ajukan inquiry melalui halaman OEM.",
      },
    ],
  },
] as const;

const jobs = [
  {
    title: "Sales Area — Jawa Barat",
    department: "Sales",
    location: "Bandung",
    employmentType: "full_time",
    description:
      "Mengembangkan pasar distributor dan toko onderdil di wilayah Jawa Barat, melakukan kunjungan rutin, serta mencapai target penjualan bulanan.",
    requirements:
      "Minimal 2 tahun pengalaman sales spareparts/otomotif.\nMemiliki kendaraan pribadi.\nDomisili Bandung dan sekitarnya.",
  },
  {
    title: "Admin Gudang",
    department: "Operasional",
    location: "Cikarang",
    employmentType: "full_time",
    description:
      "Mengelola pencatatan stok masuk dan keluar, memastikan keakuratan data gudang, dan berkoordinasi dengan tim pengiriman.",
    requirements:
      "Mahir Microsoft Excel.\nTeliti dan bertanggung jawab.\nPengalaman di gudang spareparts lebih diutamakan.",
  },
  {
    title: "Content Writer Motor",
    department: "Marketing",
    location: "Remote",
    employmentType: "contract",
    description:
      "Menulis artikel tips perawatan motor dan konten blog SEO untuk meningkatkan trafik organik website HuCha Indonesia.",
    requirements:
      "Portofolio artikel SEO.\nMemahami keyword research dasar.\nKemampuan menulis Bahasa Indonesia yang baik.",
  },
] as const;

const brands = [
  {
    name: "HuCha Racing",
    slug: "hucha-racing",
    tagline: "Performa untuk jalanan & lintasan",
    description:
      "Lini spareparts performa tinggi — kampas rem, busi, dan komponen lain yang dirancang untuk ketahanan dan daya cengkeram maksimal.",
    category: "spareparts",
    highlights: [
      "Material non-asbestos",
      "Tahan panas tinggi",
      "Cocok harian & balap",
    ],
    sortOrder: 0,
  },
  {
    name: "HuCha Lubricants",
    slug: "hucha-lubricants",
    tagline: "Cairan pelumas berkualitas",
    description:
      "Oli mesin, oli sokbreker, dan coolant dengan formulasi khusus untuk menjaga mesin dan suspensi motor Anda tetap prima.",
    category: "fluids",
    highlights: [
      "Formulasi khusus matic",
      "Perlindungan maksimal",
      "Stabil di segala cuaca",
    ],
    sortOrder: 1,
  },
  {
    name: "HuCha Auto Care",
    slug: "hucha-auto-care",
    tagline: "Perawatan kendaraan menyeluruh",
    description:
      "Shampo, pelindung cat, hingga perawatan rantai — rangkaian produk perawatan untuk membuat motor tampil dan awet.",
    category: "autocare",
    highlights: [
      "Formula aman untuk cat",
      "Kilap tahan lama",
      "Mudah digunakan",
    ],
    sortOrder: 2,
  },
] as const;

const testimonials = [
  {
    partnerName: "Budi Santoso",
    partnerBusiness: "Bengkel Jaya Motor",
    partnerRegion: "Bekasi",
    quote:
      "Kualitas spareparts HuCha konsisten dan pengiriman selalu tepat waktu. Pelanggan bengkel saya semakin percaya.",
    rating: 5,
  },
  {
    partnerName: "Rina Wijaya",
    partnerBusiness: "Toko Onderdil Rina",
    partnerRegion: "Yogyakarta",
    quote:
      "Menjadi distributor HuCha mempermudah stok kami. Tim sales responsif dan margin cukup baik.",
    rating: 5,
  },
  {
    partnerName: "Agus Prasetyo",
    partnerBusiness: "Bengkel Agus Racing",
    partnerRegion: "Surabaya",
    quote:
      "Oli dan cairan otomotif HuCha banyak dipakai di komunitas motor balap. Kualitasnya tidak mengecewakan.",
    rating: 4,
  },
] as const;

const settings = [
  {
    key: "company",
    value: {
      name: "HuCha Indonesia",
      legalName: "CV Usaha Bintang Mulia",
      address: "Jl. Raya Industri No. 45, Cikarang, Jawa Barat",
      phone: "+6280000000000",
      email: "halo@hucha.id",
      whatsapp: "+6280000000000",
    },
  },
  {
    key: "social",
    value: {
      instagram: "https://instagram.com/hucha.indonesia",
      tiktok: "https://tiktok.com/@hucha.indonesia",
      whatsapp: "https://wa.me/6280000000000",
    },
  },
  {
    key: "notification_recipients",
    value: {
      distributorLeads: ["sales@hucha.id"],
      oemLeads: ["admin@hucha.id", "sales@hucha.id"],
      contactLeads: ["sales@hucha.id"],
      applications: ["hr@hucha.id"],
    },
  },
  {
    key: "seo",
    value: {
      defaultMetaTitle: "HuCha Indonesia — Spareparts, Cairan & Autocare Motor",
      defaultMetaDescription:
        "Distributor spareparts, cairan otomotif, dan produk perawatan kendaraan berkualitas untuk motor Anda.",
    },
  },
] as const;

const products = [
  {
    name: "Kampas Rem Depan HuCha Racing",
    slug: "kampas-rem-depan-hucha-racing",
    categorySlug: "spareparts",
    subCategorySlug: "kampas-rem",
    shortDescription:
      "Kampas rem depan tipe racing dengan daya cengkeram tinggi.",
    description:
      "Kampas rem depan HuCha Racing dibuat dari material non-asbestos berkualitas tinggi dengan ketahanan panas optimal untuk penggunaan harian maupun balap.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/kampas-rem-depan",
    shopeeUrl: "https://shopee.co.id/hucha-official/kampas-rem-depan",
    tiktokshopUrl: "https://tiktok.com/@hucha.indonesia/shop/kampas-rem-depan",
    isFeatured: true,
  },
  {
    name: "Busi Iridium HuCha Pro",
    slug: "busi-iridium-hucha-pro",
    categorySlug: "spareparts",
    subCategorySlug: "busi",
    shortDescription: "Busi iridium dengan pembakaran lebih stabil.",
    description:
      "Busi Iridium HuCha Pro memberikan pembakaran optimal, akselerasi responsif, dan umur pakai lebih lama dibanding busi standar.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/busi-iridium-pro",
    shopeeUrl: "https://shopee.co.id/hucha-official/busi-iridium-pro",
    tiktokshopUrl: "https://tiktok.com/@hucha.indonesia/shop/busi-iridium-pro",
    isFeatured: false,
  },
  {
    name: "Oli Mesin HuCha Matic 10W-30",
    slug: "oli-mesin-hucha-matic-10w-30",
    categorySlug: "cairan-otomotif",
    subCategorySlug: "oli-mesin",
    shortDescription:
      "Oli mesin khusus motor matic dengan perlindungan maksimal.",
    description:
      "Oli Mesin HuCha Matic 10W-30 diformulasikan khusus untuk motor matic, menjaga mesin tetap halus, bersih, dan dingin.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/oli-matic-10w-30",
    shopeeUrl: "https://shopee.co.id/hucha-official/oli-matic-10w-30",
    tiktokshopUrl: "https://tiktok.com/@hucha.indonesia/shop/oli-matic-10w-30",
    isFeatured: true,
  },
  {
    name: "Oli Sokbreker HuCha SAE 20",
    slug: "oli-sokbreker-hucha-sae-20",
    categorySlug: "cairan-otomotif",
    subCategorySlug: "oli-sokbreker",
    shortDescription: "Oli sokbreker dengan redaman stabil dan awet.",
    description:
      "Oli sokbreker HuCha SAE 20 menjaga performa suspensi tetap stabil, mengurangi getaran, dan memperpanjang umur sokbreker.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/oli-sokbreker-sae-20",
    shopeeUrl: "https://shopee.co.id/hucha-official/oli-sokbreker-sae-20",
    tiktokshopUrl:
      "https://tiktok.com/@hucha.indonesia/shop/oli-sokbreker-sae-20",
    isFeatured: false,
  },
  {
    name: "Shampo Motor HuCha Super Gloss",
    slug: "shampo-motor-hucha-super-gloss",
    categorySlug: "perawatan-kendaraan",
    subCategorySlug: "pembersih",
    shortDescription: "Shampo motor dengan busa tebal dan hasil mengkilap.",
    description:
      "Shampo Motor HuCha Super Gloss membersihkan kotoran dan lumpur tanpa merusak cat, menghasilkan kilap alami.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/shampo-motor-super-gloss",
    shopeeUrl: "https://shopee.co.id/hucha-official/shampo-motor-super-gloss",
    tiktokshopUrl:
      "https://tiktok.com/@hucha.indonesia/shop/shampo-motor-super-gloss",
    isFeatured: false,
  },
  {
    name: "Pelindung Cat HuCha Nano Ceramic",
    slug: "pelindung-cat-hucha-nano-ceramic",
    categorySlug: "perawatan-kendaraan",
    subCategorySlug: "pelindung",
    shortDescription: "Coating nano ceramic untuk melindungi cat motor.",
    description:
      "Pelindung Cat HuCha Nano Ceramic membentuk lapisan pelindung anti gores dan anti air selama berbulan-bulan.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/nano-ceramic-coating",
    shopeeUrl: "https://shopee.co.id/hucha-official/nano-ceramic-coating",
    tiktokshopUrl:
      "https://tiktok.com/@hucha.indonesia/shop/nano-ceramic-coating",
    isFeatured: false,
  },
] as const;

const articles = [
  {
    title: "Cara Memilih Kampas Rem Motor yang Tepat",
    blogCategorySlug: "tips-perawatan-motor",
    tagSlugs: ["kampas-rem", "tips-perawatan"],
    excerpt:
      "Jangan asal pilih kampas rem. Pelajari perbedaan material dan tipe kampas rem sesuai kebutuhan berkendara Anda.",
    body:
      "Kampas rem adalah komponen vital yang menentukan keselamatan berkendara.\n\n" +
      "Ada tiga tipe utama kampas rem: organik, semi-metallic, dan racing. Kampas organik lebih halus dan senyap, cocok untuk pemakaian harian. Kampas semi-metallic menawarkan daya cengkeram lebih kuat untuk medan berat. Kampas racing dirancang untuk ketahanan panas tinggi.\n\n" +
      "Perhatikan juga kompatibilitas dengan velg dan sistem rem motor Anda. Pastikan membeli kampas rem original dari distributor resmi agar aman dan awet.",
  },
  {
    title: "Kapan Oli Sokbreker Motor Perlu Diganti?",
    blogCategorySlug: "pemilihan-cairan",
    tagSlugs: ["oli-sokbreker", "tips-perawatan"],
    excerpt:
      "Oli sokbreker sering terlupakan. Ketahui tanda-tanda oli sokbreker sudah harus diganti.",
    body:
      "Oli sokbreker bekerja meredam getaran dan menjaga kenyamanan berkendara.\n\n" +
      "Tanda oli sokbreker perlu diganti: sokbreker terasa keras, muncul bunyi dentuman saat melewati polisi tidur, atau terjadi kebocoran oli di kaki sokbreker.\n\n" +
      "Untuk pemakaian normal, ganti oli sokbreker setiap 15.000 km atau setahun sekali. Gunakan oli sokbreker dengan viskositas yang direkomendasikan pabrikan motor Anda.",
  },
  {
    title: "HuCha Indonesia Hadir di Pameran Otomotif 2026",
    blogCategorySlug: "berita-perusahaan",
    tagSlugs: ["berita", "distributor"],
    excerpt:
      "HuCha Indonesia memperkenalkan lini produk terbaru sekaligus membuka pendaftaran distributor baru.",
    body:
      "Pada pameran otomotif 2026, HuCha Indonesia menampilkan produk unggulan spareparts, cairan otomotif, dan perawatan kendaraan.\n\n" +
      "Kami juga mengumumkan program kemitraan distributor dengan dukungan penuh untuk toko onderdil dan bengkel di seluruh Indonesia.\n\n" +
      "Kunjungi booth kami atau hubungi tim sales untuk informasi kemitraan lebih lanjut.",
  },
] as const;

async function seedCategories(): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const group of categoryGroups) {
    const topLevel = await prisma.category.upsert({
      where: { slug: group.slug },
      update: { name: group.name, type: group.type },
      create: { name: group.name, slug: group.slug, type: group.type },
    });
    ids[group.slug] = topLevel.id;

    for (const subName of group.subcategories) {
      const subSlug = slugify(subName);
      const sub = await prisma.category.upsert({
        where: { slug: subSlug },
        update: { name: subName, type: group.type, parentId: topLevel.id },
        create: {
          name: subName,
          slug: subSlug,
          type: group.type,
          parentId: topLevel.id,
        },
      });
      ids[subSlug] = sub.id;
    }
  }
  return ids;
}

async function seedBlogCategories(): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const name of blogCategories) {
    const slug = slugify(name);
    const category = await prisma.blogCategory.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    ids[slug] = category.id;
  }
  return ids;
}

async function seedTags(): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const name of tags) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    ids[slug] = tag.id;
  }
  return ids;
}

async function seedFaq(): Promise<void> {
  for (const group of faqGroups) {
    const category = await prisma.faqCategory.upsert({
      where: { slug: group.slug },
      update: { name: group.name },
      create: { name: group.name, slug: group.slug },
    });

    for (const [index, faq] of group.faqs.entries()) {
      const existing = await prisma.faq.findFirst({
        where: { faqCategoryId: category.id, question: faq.question },
      });
      if (!existing) {
        await prisma.faq.create({
          data: {
            faqCategoryId: category.id,
            question: faq.question,
            answer: faq.answer,
            sortOrder: index,
            isPublished: true,
          },
        });
      }
    }
  }
}

async function seedJobs(): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const job of jobs) {
    const slug = slugify(job.title);
    const created = await prisma.job.upsert({
      where: { slug },
      update: job,
      create: { ...job, slug },
    });
    ids[slug] = created.id;
  }
  return ids;
}

async function seedBrands(): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const brand of brands) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        tagline: brand.tagline,
        description: brand.description,
        category: brand.category,
        highlights: brand.highlights,
        sortOrder: brand.sortOrder,
        isPublished: true,
        deletedAt: null,
      },
      create: {
        ...brand,
        highlights: brand.highlights,
        isPublished: true,
      },
    });
    ids[brand.slug] = created.id;
  }
  return ids;
}

async function seedTestimonials(): Promise<void> {
  for (const item of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { partnerName: item.partnerName, deletedAt: null },
    });
    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: { ...item, isPublished: true },
      });
    } else {
      await prisma.testimonial.create({
        data: { ...item, isPublished: true },
      });
    }
  }
}

async function seedSettings(): Promise<void> {
  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
}

const notifications = [
  {
    type: "lead",
    title: "Lead kemitraan baru",
    body: "Budi Santoso (Bengkel Jaya Motor, Bekasi) mengirim formulir kemitraan.",
    isRead: false,
    daysAgo: 0,
  },
  {
    type: "lead",
    title: "Inquiry OEM baru",
    body: "PT Maju Bersama menanyakan produksi maklon oli sokbreker.",
    isRead: false,
    daysAgo: 1,
  },
  {
    type: "application",
    title: "Lamaran baru",
    body: "Rina Wijaya melamar posisi Sales Area — Jawa Barat.",
    isRead: true,
    daysAgo: 2,
  },
  {
    type: "lead",
    title: "Pesan kontak baru",
    body: "Agus Prasetyo mengirim pertanyaan via halaman Kontak.",
    isRead: true,
    daysAgo: 3,
  },
  {
    type: "system",
    title: "Selamat datang",
    body: "Panel admin HuCha Indonesia telah aktif. Kelola pengaturan dan pantau aktivitas di sini.",
    isRead: true,
    daysAgo: 5,
  },
] as const;

const auditLogSeed = [
  {
    action: "login",
    entityType: "user",
    entityId: null,
    meta: { method: "email" },
    daysAgo: 0,
  },
  {
    action: "create",
    entityType: "product",
    entityId: "5",
    meta: { name: "Pelindung Cat HuCha Nano Ceramic" },
    daysAgo: 1,
  },
  {
    action: "publish",
    entityType: "article",
    entityId: "3",
    meta: { title: "HuCha Indonesia Hadir di Pameran Otomotif 2026" },
    daysAgo: 1,
  },
  {
    action: "update",
    entityType: "lead",
    entityId: "2",
    meta: { status: "contacted" },
    daysAgo: 2,
  },
  {
    action: "update",
    entityType: "user",
    entityId: "2",
    meta: { isAdmin: true },
    daysAgo: 3,
  },
  {
    action: "update",
    entityType: "setting",
    entityId: "seo",
    meta: { key: "seo" },
    daysAgo: 4,
  },
  {
    action: "create",
    entityType: "job",
    entityId: "4",
    meta: { title: "Content Writer Motor" },
    daysAgo: 5,
  },
] as const;

async function seedNotifications(userId: number): Promise<void> {
  for (const item of notifications) {
    const createdAt = new Date(Date.now() - item.daysAgo * 86_400_000);
    const existing = await prisma.notification.findFirst({
      where: { userId, title: item.title, createdAt: { gte: createdAt } },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          type: item.type,
          title: item.title,
          body: item.body,
          isRead: item.isRead,
          createdAt,
        },
      });
    }
  }
}

async function seedAuditLogs(userId: number): Promise<void> {
  for (const item of auditLogSeed) {
    const createdAt = new Date(Date.now() - item.daysAgo * 86_400_000);
    const existing = await prisma.auditLog.findFirst({
      where: { userId, action: item.action, entityType: item.entityType, createdAt: { gte: createdAt } },
    });
    if (!existing) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: item.action,
          entityType: item.entityType,
          entityId: item.entityId,
          meta: item.meta,
          createdAt,
        },
      });
    }
  }
}

const ADMIN_EMAIL = "admin@hucha.id";

function getAdminSeedPassword(): string {
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password) {
    throw new Error(
      "ADMIN_SEED_PASSWORD is required to seed the admin credential. " +
        "Set it when running the seed, e.g.: " +
        "ADMIN_SEED_PASSWORD='<strong-password>' npx prisma db seed"
    );
  }
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    throw new Error(
      `ADMIN_SEED_PASSWORD ditolak: ${parsed.error.issues[0]?.message}`
    );
  }
  return parsed.data;
}

async function seedAdminUser(): Promise<number> {
  const password = getAdminSeedPassword();
  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: { accounts: true },
  });

  if (existing) {
    const updates: Prisma.UserUpdateInput = {};
    if (!existing.isAdmin) updates.isAdmin = true;
    if (!existing.isActive) updates.isActive = true;
    if (!existing.emailVerified) updates.emailVerified = true;
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({ where: { id: existing.id }, data: updates });
    }

    const hasCredential = existing.accounts.some(
      (account) => account.providerId === "credential"
    );
    if (!hasCredential) {
      await prisma.account.create({
        data: {
          userId: existing.id,
          providerId: "credential",
          accountId: String(existing.id),
          password: passwordHash,
        },
      });
    }
    return existing.id;
  }

  const admin = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: "Super Admin",
        email: ADMIN_EMAIL,
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
        password: passwordHash,
      },
    });
    return user;
  });
  return admin.id;
}

async function seedPlaceholderMedia(
  uploadedById: number | null
): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  const mediaByFile: Record<
    string,
    { fileName: string; mimeType: string; sizeBytes: number; altText: string }
  > = {
    "/media/seed/kampas-rem.jpg": {
      fileName: "kampas-rem.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 0,
      altText: "Kampas rem depan HuCha Racing",
    },
    "/media/seed/busi.jpg": {
      fileName: "busi.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 0,
      altText: "Busi Iridium HuCha Pro",
    },
    "/media/seed/oli-mesin.jpg": {
      fileName: "oli-mesin.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 0,
      altText: "Oli mesin HuCha Matic 10W-30",
    },
    "/media/seed/oli-sokbreker.jpg": {
      fileName: "oli-sokbreker.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 0,
      altText: "Oli sokbreker HuCha SAE 20",
    },
    "/media/seed/shampo-motor.jpg": {
      fileName: "shampo-motor.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 0,
      altText: "Shampo motor HuCha Super Gloss",
    },
    "/media/seed/nano-ceramic.jpg": {
      fileName: "nano-ceramic.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 0,
      altText: "Pelindung cat HuCha Nano Ceramic",
    },
  };

  for (const [filePath, meta] of Object.entries(mediaByFile)) {
    const existing = await prisma.media.findFirst({ where: { filePath } });
    if (existing) {
      ids[filePath] = existing.id;
      continue;
    }
    const media = await prisma.media.create({
      data: { ...meta, filePath, uploadedById },
    });
    ids[filePath] = media.id;
  }
  return ids;
}

const productMediaFile: Record<string, string> = {
  "kampas-rem-depan-hucha-racing": "/media/seed/kampas-rem.jpg",
  "busi-iridium-hucha-pro": "/media/seed/busi.jpg",
  "oli-mesin-hucha-matic-10w-30": "/media/seed/oli-mesin.jpg",
  "oli-sokbreker-hucha-sae-20": "/media/seed/oli-sokbreker.jpg",
  "shampo-motor-hucha-super-gloss": "/media/seed/shampo-motor.jpg",
  "pelindung-cat-hucha-nano-ceramic": "/media/seed/nano-ceramic.jpg",
};

const productBrandByCategory: Record<string, string> = {
  spareparts: "hucha-racing",
  "cairan-otomotif": "hucha-lubricants",
  "perawatan-kendaraan": "hucha-auto-care",
};

async function seedProducts(
  categoryIds: Record<string, number>,
  mediaIds: Record<string, number>,
  brandIds: Record<string, number>
): Promise<void> {
  for (const product of products) {
    const mediaId =
      mediaIds[productMediaFile[product.slug]] ?? Object.values(mediaIds)[0];

    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });
    const data: Prisma.ProductUncheckedCreateInput = {
      name: product.name,
      slug: product.slug,
      categoryId: categoryIds[product.categorySlug],
      subCategoryId: categoryIds[product.subCategorySlug],
      brandId: brandIds[productBrandByCategory[product.categorySlug]],
      shortDescription: product.shortDescription,
      description: product.description,
      tokopediaUrl: product.tokopediaUrl,
      shopeeUrl: product.shopeeUrl,
      tiktokshopUrl: product.tiktokshopUrl,
      isFeatured: product.isFeatured,
      status: "published",
    };

    if (existing) {
      await prisma.product.update({ where: { slug: product.slug }, data });
    } else {
      const created = await prisma.product.create({ data });
      await prisma.productImage.create({
        data: { productId: created.id, mediaId, sortOrder: 0 },
      });
    }
  }
}

async function seedArticles(
  blogCategoryIds: Record<string, number>,
  tagIds: Record<string, number>,
  authorId: number,
  mediaIds: Record<string, number>
): Promise<void> {
  for (const article of articles) {
    const slug = slugify(article.title);
    const tagIdsForArticle = article.tagSlugs.map((tagSlug) => tagIds[tagSlug]);
    const featuredMediaId = Object.values(mediaIds)[0] ?? null;

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      await prisma.article.update({
        where: { slug },
        data: {
          title: article.title,
          blogCategoryId: blogCategoryIds[article.blogCategorySlug],
          featuredMediaId,
          excerpt: article.excerpt,
          body: article.body,
          status: "published",
          publishedAt: existing.publishedAt ?? new Date(),
        },
      });
      await prisma.articleTag.deleteMany({ where: { articleId: existing.id } });
      await prisma.articleTag.createMany({
        data: tagIdsForArticle.map((tagId) => ({
          articleId: existing.id,
          tagId,
        })),
      });
    } else {
      const created = await prisma.article.create({
        data: {
          title: article.title,
          slug,
          blogCategoryId: blogCategoryIds[article.blogCategorySlug],
          featuredMediaId,
          excerpt: article.excerpt,
          body: article.body,
          status: "published",
          publishedAt: new Date(),
          authorId,
        },
      });
      await prisma.articleTag.createMany({
        data: tagIdsForArticle.map((tagId) => ({
          articleId: created.id,
          tagId,
        })),
      });
    }
  }
}

async function main(): Promise<void> {
  const adminId = await seedAdminUser();

  const categoryIds = await seedCategories();
  const blogCategoryIds = await seedBlogCategories();
  const tagIds = await seedTags();
  await seedFaq();
  await seedJobs();
  const brandIds = await seedBrands();
  await seedTestimonials();
  await seedSettings();
  const mediaIds = await seedPlaceholderMedia(adminId);

  await seedProducts(categoryIds, mediaIds, brandIds);
  await seedArticles(blogCategoryIds, tagIds, adminId, mediaIds);

  await seedNotifications(adminId);
  await seedAuditLogs(adminId);

  console.info(
    "Seed completed: categories, blog categories, tags, FAQs, jobs, brands, testimonials, settings, admin user, sample products & articles, notifications & audit logs."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

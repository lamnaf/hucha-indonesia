export interface MockArticle {
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  tags: string[];
  excerpt: string;
  body: string;
  publishedAt: string;
  readingMinutes: number;
}

export const blogCategories = [
  { name: "Tips Perawatan Motor", slug: "tips-perawatan-motor" },
  { name: "Pemilihan Cairan", slug: "pemilihan-cairan" },
  { name: "Berita Perusahaan", slug: "berita-perusahaan" },
] as const;

export const articles: MockArticle[] = [
  {
    title: "Cara Memilih Kampas Rem Motor yang Tepat",
    slug: "cara-memilih-kampas-rem-motor-yang-tepat",
    category: "Tips Perawatan Motor",
    categorySlug: "tips-perawatan-motor",
    tags: ["Kampas Rem", "Tips Perawatan"],
    excerpt:
      "Jangan asal pilih kampas rem. Pelajari perbedaan material dan tipe kampas rem sesuai kebutuhan berkendara Anda.",
    body:
      "Kampas rem adalah komponen vital yang menentukan keselamatan berkendara.\n\n" +
      "Ada tiga tipe utama kampas rem: organik, semi-metallic, dan racing. Kampas organik lebih halus dan senyap, cocok untuk pemakaian harian. Kampas semi-metallic menawarkan daya cengkeram lebih kuat untuk medan berat. Kampas racing dirancang untuk ketahanan panas tinggi.\n\n" +
      "Perhatikan juga kompatibilitas dengan velg dan sistem rem motor Anda. Pastikan membeli kampas rem original dari distributor resmi agar aman dan awet.",
    publishedAt: "2026-01-18",
    readingMinutes: 4,
  },
  {
    title: "Kapan Oli Sokbreker Motor Perlu Diganti?",
    slug: "kapan-oli-sokbreker-motor-perlu-diganti",
    category: "Pemilihan Cairan",
    categorySlug: "pemilihan-cairan",
    tags: ["Oli Sokbreker", "Tips Perawatan"],
    excerpt:
      "Oli sokbreker sering terlupakan. Ketahui tanda-tanda oli sokbreker sudah harus diganti.",
    body:
      "Oli sokbreker bekerja meredam getaran dan menjaga kenyamanan berkendara.\n\n" +
      "Tanda oli sokbreker perlu diganti: sokbreker terasa keras, muncul bunyi dentuman saat melewati polisi tidur, atau terjadi kebocoran oli di kaki sokbreker.\n\n" +
      "Untuk pemakaian normal, ganti oli sokbreker setiap 15.000 km atau setahun sekali. Gunakan oli sokbreker dengan viskositas yang direkomendasikan pabrikan motor Anda.",
    publishedAt: "2026-02-02",
    readingMinutes: 5,
  },
  {
    title: "HuCha Indonesia Hadir di Pameran Otomotif 2026",
    slug: "hucha-indonesia-hadir-di-pameran-otomotif-2026",
    category: "Berita Perusahaan",
    categorySlug: "berita-perusahaan",
    tags: ["Berita", "Distributor"],
    excerpt:
      "HuCha Indonesia memperkenalkan lini produk terbaru sekaligus membuka pendaftaran distributor baru.",
    body:
      "Pada pameran otomotif 2026, HuCha Indonesia menampilkan produk unggulan spareparts, cairan otomotif, dan perawatan kendaraan.\n\n" +
      "Kami juga mengumumkan program kemitraan distributor dengan dukungan penuh untuk toko onderdil dan bengkel di seluruh Indonesia.\n\n" +
      "Kunjungi booth kami atau hubungi tim sales untuk informasi kemitraan lebih lanjut.",
    publishedAt: "2026-03-10",
    readingMinutes: 3,
  },
] as const;

export function getArticleBySlug(slug: string): MockArticle | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesNewestFirst(): MockArticle[] {
  return [...articles].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

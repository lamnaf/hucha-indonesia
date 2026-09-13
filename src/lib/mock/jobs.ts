export type EmploymentType =
  "full_time" | "part_time" | "contract" | "internship";

export const employmentTypeLabel: Record<EmploymentType, string> = {
  full_time: "Penuh Waktu",
  part_time: "Paruh Waktu",
  contract: "Kontrak",
  internship: "Magang",
};

export interface MockJob {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requirements: string[];
}

export const jobs: MockJob[] = [
  {
    id: 1,
    title: "Sales Executive Distribusi",
    slug: "sales-executive-distribusi",
    department: "Sales",
    location: "Pasuruan, Jawa Timur",
    employmentType: "full_time",
    description:
      "Bergabunglah dengan tim sales HuCha Indonesia untuk memperluas jaringan distributor, toko onderdil, dan bengkel di seluruh Indonesia. Anda akan menjadi ujung tombak pertumbuhan kemitraan perusahaan.",
    requirements: [
      "Minimal D3, semua jurusan",
      "Pengalaman minimal 2 tahun di bidang penjualan/distribusi",
      "Memiliki kendaraan dan bersedia melakukan perjalanan dinas",
      "Komunikasi dan negosiasi yang baik",
      "Memahami pasar sparepart atau otomotif (nilai tambah)",
    ],
  },
    {
    id: 2,
    title: "Content & SEO Specialist",
    slug: "content-seo-specialist",
    department: "Marketing",
    location: "Pasuruan, Jawa Timur",
    employmentType: "full_time",
    description:
      "Kelola konten blog, katalog produk, dan strategi SEO HuCha Indonesia. Anda akan membuat artikel edukatif seputar perawatan motor dan mengoptimalkan konten agar mudah ditemukan di mesin pencari.",
    requirements: [
      "Minimal S1 di bidang komunikasi, marketing, atau terkait",
      "Menguasai SEO on-page dan riset kata kunci",
      "Mampu menulis konten dalam Bahasa Indonesia yang menarik",
      "Pengalaman dengan WordPress atau CMS lainnya (nilai tambah)",
      "Portofolio tulisan wajib dilampirkan",
    ],
  },
  {
    id: 3,
    title: "Quality Control Staff",
    slug: "quality-control-staff",
    department: "Operasional",
    location: "Pasuruan, Jawa Timur",
    employmentType: "full_time",
    description:
      "Pastikan setiap produk spareparts, cairan, dan perawatan yang keluar dari gudang memenuhi standar kualitas HuCha Indonesia sebelum dikirim ke distributor.",
    requirements: [
      "Minimal SMA/SMK, jurusan teknik atau otomotif",
      "Teliti dan memiliki perhatian terhadap detail",
      "Mampu bekerja dalam tim",
      "Bersedia bekerja shift",
    ],
  },
  {
    id: 4,
    title: "Admin Gudang",
    slug: "admin-gudang",
    department: "Operasional",
    location: "Pasuruan, Jawa Timur",
    employmentType: "contract",
    description:
      "Mengelola administrasi stok, pencatatan barang masuk dan keluar, serta membantu kelancaran operasional gudang HuCha Indonesia.",
    requirements: [
      "Minimal SMA/SMK semua jurusan",
      "Menguasai Microsoft Excel / Google Sheets",
      "Jujur dan bertanggung jawab",
      "Bersedia ditempatkan di Pasuruan",
    ],
  },
];

export function getJobBySlug(slug: string): MockJob | undefined {
  return jobs.find((job) => job.slug === slug);
}

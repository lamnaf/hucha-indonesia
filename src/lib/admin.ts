import type {
  AuditAction,
  CategoryType,
  ProductStatus,
  ArticleStatus,
  JobStatus,
  ApplicationStatus,
  LeadType,
  LeadStatus,
} from "@/infrastructure/database/generated/client";

/** Human-readable Indonesian labels for admin surfaces (blueprint §19/§18). */

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  spareparts: "Spareparts",
  fluids: "Cairan Otomotif",
  autocare: "Perawatan Kendaraan",
};

export function categoryTypeLabel(type: CategoryType): string {
  return CATEGORY_TYPE_LABELS[type] ?? type;
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draf",
  published: "Terbit",
};

export function productStatusLabel(status: ProductStatus): string {
  return PRODUCT_STATUS_LABELS[status] ?? status;
}

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draf",
  scheduled: "Terjadwal",
  published: "Terbit",
};

export function articleStatusLabel(status: ArticleStatus): string {
  return ARTICLE_STATUS_LABELS[status] ?? status;
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: "Dibuka",
  closed: "Ditutup",
};

export function jobStatusLabel(status: JobStatus): string {
  return JOB_STATUS_LABELS[status] ?? status;
}

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Kontrak",
  internship: "Magang",
};

export function employmentTypeLabel(type: string): string {
  return EMPLOYMENT_TYPE_LABELS[type] ?? type;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Baru",
  reviewed: "Direview",
  rejected: "Ditolak",
  hired: "Diterima",
};

export function applicationStatusLabel(status: ApplicationStatus): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  distributor: "Distributor",
  oem: "OEM",
  contact: "Kontak",
  career_note: "Catatan Karir",
};

export function leadTypeLabel(type: LeadType): string {
  return LEAD_TYPE_LABELS[type] ?? type;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Baru",
  contacted: "Dihubungi",
  converted: "Konversi",
  rejected: "Ditolak",
};

export function leadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABELS[status] ?? status;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: "Membuat",
  update: "Memperbarui",
  delete: "Menghapus",
  publish: "Menerbitkan",
  login: "Masuk",
};

export function auditActionLabel(action: AuditAction): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

const ENTITY_LABELS: Record<string, string> = {
  user: "Pengguna",
  role: "Peran",
  product: "Produk",
  article: "Artikel",
  lead: "Lead",
  job: "Lowongan",
  application: "Lamaran",
  media: "Media",
  setting: "Pengaturan",
  seo: "SEO",
  testimonial: "Testimoni",
  faq: "FAQ",
  faq_category: "Kategori FAQ",
  category: "Kategori",
  blog_category: "Kategori Blog",
  tag: "Tag",
  brand: "Merek",
  newsletter: "Newsletter",
};

export function entityLabel(type: string): string {
  return ENTITY_LABELS[type] ?? type;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: Date): string {
  return DATE_FORMATTER.format(date);
}

export function formatDateTime(date: Date): string {
  return DATETIME_FORMATTER.format(date);
}

/** Compact relative time in Indonesian ("baru saja", "5 menit lalu"). */
export function formatRelativeTime(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(date);
}

/** Converts a `YYYY-MM` chart label to a short Indonesian month ("Agu 26"). */
export function monthLabel(label: string): string {
  const [year, month] = label.split("-").map(Number);
  if (!year || !month) return label;
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
  });
}

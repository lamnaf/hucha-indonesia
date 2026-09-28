import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalisasi URL gambar — pertahankan lokasi storage sesuai data:
 * - URL absolut (R2 / CDN / eksternal) → return as-is
 * - /uploads/* → tetap local path (Vercel serve dari /public)
 * - /media/* (seed lama) → fallback /og-default.png
 * - Aset statis lain → return as-is
 */
export function normalizeImageUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // 1. Absolute URL: preserve exactly as stored.
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 2. Seed data under /media/ -> use fallback static image
  if (trimmed.startsWith("/media/")) {
    return "/og-default.png";
  }

  // 3. Local uploaded files -> keep local path.
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // 4. Static public assets (/tentang-hucha/..., /cairan.jpeg, dll) -> return as-is
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function getImageUrl(path: string | null | undefined): string {
  return normalizeImageUrl(path);
}

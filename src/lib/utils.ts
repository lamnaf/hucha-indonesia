import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let publicImageBaseCache: string | null = null;

function getPublicImageBase(): string {
  if (publicImageBaseCache) return publicImageBaseCache;
  const url = process.env.STORAGE_PUBLIC_URL;
  if (!url) return "";
  try {
    const parsed = new URL(url);
    publicImageBaseCache = `${parsed.protocol}//${parsed.host}`;
    return publicImageBaseCache;
  } catch {
    return "";
  }
}

/**
 * Normalisasi URL gambar:
 * - URL S3 endpoint (endpoint/bucket) → redirect ke public URL
 * - Path relatif /uploads/ → prefix ke public URL
 * - URL sudah absolut dan benar → return as-is
 */
export function normalizeImageUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Sudah absolut URL (http/https) - cek apakah endpoint S3 yang salah
  if (/^https?:\/\//i.test(trimmed)) {
    const publicBase = getPublicImageBase();
    if (!publicBase) return trimmed;

    try {
      const parsed = new URL(trimmed);
      const endpoint = process.env.STORAGE_ENDPOINT?.replace(/^https?:\/\//, "");
      if (endpoint && parsed.hostname === endpoint) {
        // URL lama pakai endpoint S3 → rewrite ke public URL
        const newPath = parsed.pathname.replace(/^\/+/, "");
        return `${publicBase}/${newPath}`;
      }
    } catch {
      // ignore
    }
    return trimmed;
  }

  // Path relatif seperti /uploads/xxx.webp atau uploads/xxx.webp
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const publicBase = getPublicImageBase();
    if (!publicBase) return trimmed;
    const clean = trimmed.replace(/^\/+/, "");
    return `${publicBase}/${clean}`;
  }

  return trimmed;
}

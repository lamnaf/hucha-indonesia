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

  // 1. Sudah absolut URL
  if (/^https?:\/\//i.test(trimmed)) {
    const publicBase = getPublicImageBase();
    if (!publicBase) return trimmed;

    try {
      const parsed = new URL(trimmed);
      const endpoint = process.env.STORAGE_ENDPOINT?.replace(/^https?:\/\//, "");
      if (endpoint && parsed.hostname === endpoint) {
        const newPath = parsed.pathname.replace(/^\/+/, "");
        return `${publicBase}/${newPath}`;
      }
    } catch {
      // ignore
    }
    return trimmed;
  }

  // 2. Path internal (uploads atau seed data) -> prefix ke public URL
  const publicBase = getPublicImageBase();
  if (!publicBase) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  const clean = trimmed.replace(/^\/+/, "");
  return `${publicBase}/${clean}`;
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  const base = getPublicImageBase();
  if (!base) {
    // relative to origin
    return path.startsWith('/') ? path : `/${path}`;
  }
  // base already includes protocol and host, no trailing slash
  return `${base}/${path.startsWith('/') ? path.slice(1) : path}`;
}

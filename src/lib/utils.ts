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
    // Keep full URL (origin + path), trim trailing slashes.
    // Penting karena STORAGE_PUBLIC_URL bisa seperti https://cdn.com/prefix
    const parsed = new URL(url);
    const withoutTrailingSlash = url.replace(/\/+$/, "");
    // Validate URL
    new URL(withoutTrailingSlash);
    publicImageBaseCache = withoutTrailingSlash;
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

  // 2. Seed data under /media/ -> use fallback static image
  if (trimmed.startsWith("/media/")) {
    return "/og-default.png";
  }

  // 3. Uploaded media -> prefix dengan public URL jika diset
  if (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("uploads/")
  ) {
    const publicBase = getPublicImageBase();
    if (!publicBase) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

    const clean = trimmed.replace(/^\/+/, "");
    return `${publicBase}/${clean}`;
  }

  // 4. Static public assets (/tentang-hucha/..., /cairan.jpeg, dll) -> return as-is
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function getImageUrl(path: string | null | undefined): string {
  return normalizeImageUrl(path);
}

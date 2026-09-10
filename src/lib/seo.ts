import type { Metadata } from "next";

/**
 * Canonical site URL. Uses `APP_URL` when it points at a real (non-localhost)
 * deployment; otherwise falls back to `https://hucha.id` so local builds never
 * emit localhost canonical/OG URLs.
 */
export function siteUrl(): string {
  const appUrl = process.env.APP_URL;
  if (appUrl && !appUrl.includes("localhost")) {
    return appUrl.replace(/\/+$/, "");
  }
  return "https://hucha.id";
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  /**
   * Absolute or site-relative path to the Open Graph image. Falls back to
   * the default site OG image when omitted (blueprint §27 auto-fallback).
   */
  ogImage?: string;
  openGraphType?: "website" | "article";
}

/**
 * Path (relative to the site root) of the default Open Graph image, used as
 * a fallback whenever an entity has no explicit OG image (§27).
 */
export const DEFAULT_OG_IMAGE = "/og-default.png";

function resolveOgImage(ogImage?: string): string {
  if (!ogImage) {
    return DEFAULT_OG_IMAGE;
  }
  return ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);
}

/**
 * Build a per-page `Metadata` object with canonical URL, Open Graph and
 * Twitter Card tags, so every public page is SEO-ready without repeating
 * boilerplate (§17, §27, §35).
 */
export function pageMetadata({
  title,
  description,
  path,
  ogImage,
  openGraphType = "website",
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = resolveOgImage(ogImage);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "HuCha Indonesia",
      locale: "id_ID",
      type: openGraphType,
      images: [
        {
          url: imageUrl,
          alt: title,
          // The default asset is authored at 1200×630; a caller-supplied OG
          // image has unknown dimensions, so declare width/height only for
          // the fallback to avoid publishing incorrect metadata.
          ...(ogImage ? {} : { width: 1200, height: 630 }),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/**
 * robots.txt (blueprint §27): `/admin/*` excluded from indexing (§8).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

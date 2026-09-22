import type { NextConfig } from "next";

const isProduction = process.env.APP_ENV === "production";

// Media may be served from S3-compatible storage (STORAGE_PUBLIC_URL or
// <STORAGE_ENDPOINT>/<STORAGE_BUCKET>). Those origins must be allowed by the
// image CSP or uploaded media will not render when STORAGE_DRIVER=s3.
function storageImageOrigins() {
  if ((process.env.STORAGE_DRIVER ?? "local") !== "s3") {
    return [];
  }
  const candidate = process.env.STORAGE_PUBLIC_URL || process.env.STORAGE_ENDPOINT;
  if (!candidate) {
    return [];
  }
  try {
    return [new URL(candidate).origin];
  } catch {
    return [];
  }
}

// GA4 / GTM scripts are loaded from Google's domains when enabled via admin
// settings, so allow them through the CSP regardless (harmless when unused).
const analyticsDomains = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://analytics.google.com",
  "https://region1.google-analytics.com",
];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${analyticsDomains.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: https://*.r2.dev ${storageImageOrigins().join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' ${analyticsDomains.join(" ")}`,
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  // `upgrade-insecure-requests` must not run on plain-HTTP local dev,
  // where it would force https and break local subresources.
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
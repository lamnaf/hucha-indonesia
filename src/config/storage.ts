/**
 * Media storage configuration (blueprint §25 / §26).
 *
 * Two drivers:
 *   - `local` (default): writes under `/public/uploads` on the local
 *     filesystem. Suitable for development and single-node Docker deploys.
 *   - `s3`: S3-compatible object storage (AWS S3, Cloudflare R2, MinIO).
 *     Required for serverless platforms (e.g. Vercel) where the filesystem
 *     is ephemeral. All values come from the environment — nothing is
 *     hardcoded.
 */

export type StorageDriverName = "local" | "s3";

export interface StorageConfig {
  driver: StorageDriverName;
  /** s3 driver — service endpoint (e.g. https://<account>.r2.cloudflarestorage.com). */
  endpoint?: string;
  region: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  /**
   * Public base URL objects are served from (e.g. a CDN). Defaults to
   * `<endpoint>/<bucket>` (path-style) when unset.
   */
  publicUrl?: string;
  forcePathStyle: boolean;
}

function boolFromEnv(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined || raw === "") {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export function getStorageConfig(): StorageConfig {
  const driverRaw = process.env.STORAGE_DRIVER ?? "local";
  const driver: StorageDriverName =
    driverRaw === "s3" ? "s3" : driverRaw === "local" ? "local" : "local";

  const endpoint = process.env.STORAGE_ENDPOINT || undefined;
  const bucket = process.env.STORAGE_BUCKET || undefined;

  if (driver === "s3") {
    if (!bucket) {
      throw new Error(
        "STORAGE_DRIVER=s3 requires STORAGE_BUCKET to be set."
      );
    }
    const publicUrl = process.env.STORAGE_PUBLIC_URL;
    if (publicUrl) {
      let parsed: URL;
      try {
        parsed = new URL(publicUrl);
      } catch {
        throw new Error(
          `Invalid STORAGE_PUBLIC_URL: "${publicUrl}" is not a valid absolute URL.`
        );
      }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error(
          `Invalid STORAGE_PUBLIC_URL: protocol must be http(s), got "${parsed.protocol}".`
        );
      }
    }
    return {
      driver,
      endpoint,
      region: process.env.STORAGE_REGION || "auto",
      bucket,
      accessKeyId: process.env.STORAGE_KEY || undefined,
      secretAccessKey: process.env.STORAGE_SECRET || undefined,
      publicUrl:
        publicUrl ??
        (endpoint ? `${endpoint.replace(/\/+$/, "")}/${bucket}` : undefined),
      forcePathStyle: boolFromEnv("STORAGE_FORCE_PATH_STYLE", true),
    };
  }

  return {
    driver: "local",
    region: "auto",
    forcePathStyle: true,
  };
}

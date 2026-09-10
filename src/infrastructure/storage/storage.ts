import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getStorageConfig, type StorageConfig } from "@/config/storage";

/**
 * Media storage abstraction (blueprint §25 / §26 / §31).
 *
 * Media bytes are written and deleted through a single driver so the rest of
 * the app is agnostic to where files live. `local` is the default (dev /
 * single-node); `s3` is used on serverless platforms where the filesystem is
 * ephemeral. `put` returns the public URL/path that is persisted on the media
 * row and used directly as the image source.
 */

export interface StorageDriver {
  /**
   * Writes `data` under `key` and returns the public URL/path that should be
   * stored on the media row.
   */
  put(data: Buffer, key: string, contentType?: string): Promise<string>;
  /** Deletes the object referenced by a previously returned URL/path. */
  delete(objectUrl: string | null | undefined): Promise<void>;
}

class LocalStorage implements StorageDriver {
  private readonly uploadDir = path.join(process.cwd(), "public", "uploads");

  async put(data: Buffer, key: string): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });
    await writeFile(path.join(this.uploadDir, key), data);
    return `/uploads/${key}`;
  }

  async delete(objectUrl: string | null | undefined): Promise<void> {
    if (!objectUrl?.startsWith("/uploads/")) {
      return;
    }
    // Resolve the relative path under the uploads dir, guarding against
    // traversal and absolute-path values stored on the media row.
    const relPath = objectUrl.slice("/uploads/".length);
    if (!relPath || relPath.startsWith("/") || relPath.includes("..")) {
      return;
    }
    const fullPath = path.join(this.uploadDir, relPath);
    if (!fullPath.startsWith(this.uploadDir + path.sep)) {
      return;
    }
    try {
      await unlink(fullPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

/**
 * S3-compatible driver (AWS S3, Cloudflare R2, MinIO). Exported for
 * verification scripts that exercise URL/key resolution without a live
 * bucket.
 */
export class S3Storage implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  /** URL prefixes that belong to this bucket (public base + endpoint/bucket). */
  private readonly ownBases: { origin: string; basePath: string }[];
  private ensureBucketPromise: Promise<void> | null = null;

  constructor(config: StorageConfig) {
    if (config.driver !== "s3" || !config.bucket || !config.publicUrl) {
      throw new Error(
        "S3Storage requires a bucket and public URL (see STORAGE_* env vars)."
      );
    }
    // A trailing slash on STORAGE_PUBLIC_URL would produce `//key` URLs.
    this.publicUrl = config.publicUrl.replace(/\/+$/, "");
    const bases = [this.publicUrl];
    if (config.endpoint) {
      bases.push(`${config.endpoint.replace(/\/+$/, "")}/${config.bucket}`);
    }
    this.ownBases = bases.map((base) => {
      const url = new URL(base);
      return { origin: url.origin, basePath: url.pathname.replace(/\/+$/, "") };
    });
    this.bucket = config.bucket;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials:
        config.accessKeyId && config.secretAccessKey
          ? {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            }
          : undefined,
    });
  }

  async put(
    data: Buffer,
    key: string,
    contentType = "application/octet-stream"
  ): Promise<string> {
    await this.ensureBucket();
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return `${this.publicUrl}/${key}`;
  }

  async delete(objectUrl: string | null | undefined): Promise<void> {
    const key = this.keyFromUrl(objectUrl);
    if (!key) {
      return;
    }
    // DeleteObject is idempotent — missing keys do not error.
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  /**
   * Extracts the object key from a stored URL/path for the configured bucket.
   * Absolute URLs are only resolved when they belong to one of our own bases
   * (public URL or endpoint/bucket) — anything else is refused so a tampered
   * or cross-domain path can never delete objects from this bucket.
   */
  private keyFromUrl(objectUrl: string | null | undefined): string {
    const value = objectUrl?.trim() ?? "";
    if (!value) {
      return "";
    }
    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        for (const base of this.ownBases) {
          if (
            url.origin === base.origin &&
            (base.basePath === "" ||
              url.pathname === base.basePath ||
              url.pathname.startsWith(`${base.basePath}/`))
          ) {
            return url.pathname.slice(base.basePath.length).replace(/^\/+/, "");
          }
        }
      } catch {
        return "";
      }
      console.warn(
        `[storage] delete skipped: "${value}" does not belong to the configured storage`
      );
      return "";
    }
    // Legacy local-driver paths map to bare keys written by `put`.
    return value.replace(/^\/uploads\//, "");
  }

  /** Ensures the bucket exists before the first write (creates it for MinIO/dev). */
  private ensureBucket(): Promise<void> {
    if (!this.ensureBucketPromise) {
      this.ensureBucketPromise = (async () => {
        try {
          await this.client.send(
            new HeadBucketCommand({ Bucket: this.bucket })
          );
        } catch {
          try {
            await this.client.send(
              new CreateBucketCommand({ Bucket: this.bucket })
            );
          } catch (createError) {
            console.warn(
              `[storage] could not auto-create bucket "${this.bucket}"; create it manually.`,
              createError
            );
          }
        }
      })();
    }
    return this.ensureBucketPromise;
  }
}

let instance: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (!instance) {
    const config = getStorageConfig();
    instance =
      config.driver === "s3" ? new S3Storage(config) : new LocalStorage();
  }
  return instance;
}

/** Test hook: resets the cached driver (used by tests that change STORAGE_*). */
export function resetStorageForTests(): void {
  instance = null;
}

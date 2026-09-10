/**
 * Standalone verification for the image-upload pipeline's pure logic.
 * Run with: npx tsx scripts/verify-image-upload.ts
 *
 * Covers the rules that must hold regardless of driver or UI:
 *   - magic-byte sniffing (JPEG/PNG/WebP in, everything else out)
 *   - local storage put/delete round-trip + path-traversal guards
 *   - S3 object-key extraction (trailing-slash public URL, own-base matching
 *     incl. path-style endpoint/bucket URLs, cross-domain refusal, legacy
 *     local paths)
 *   - product schema publishing rules and the 5-image cap
 *   - FormData csv parsing helpers
 */
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { sniffImageType } from "@/domain/media/image-type";
import {
  getStorage,
  resetStorageForTests,
  S3Storage,
} from "@/infrastructure/storage/storage";
import { productSchema } from "@/shared/validation/product";
import { toNumberArray } from "@/domain/action-utils";

let passed = 0;
function check(name: string, run: () => void | Promise<void>) {
  return Promise.resolve()
    .then(run)
    .then(() => {
      passed += 1;
      console.log(`  ok  ${name}`);
    })
    .catch((error) => {
      console.error(`FAIL  ${name}`);
      throw error;
    });
}

const JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
  0x00, 0x00, 0x01,
]);
const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const WEBP = Buffer.concat([
  Buffer.from("RIFF", "latin1"),
  Buffer.from([0x24, 0x00, 0x00, 0x00]),
  Buffer.from("WEBPVP8 ", "latin1"),
  Buffer.alloc(6),
]);

async function main() {
  console.log("image-type sniffing");
  await check("accepts JPEG magic bytes", () => {
    assert.equal(sniffImageType(JPEG), "image/jpeg");
  });
  await check("accepts PNG magic bytes", () => {
    assert.equal(sniffImageType(PNG), "image/png");
  });
  await check("accepts WebP (RIFF/WEBP) magic bytes", () => {
    assert.equal(sniffImageType(WEBP), "image/webp");
  });
  await check("rejects SVG/GIF/text/truncated buffers", () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const gif = Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(12)]);
    assert.equal(sniffImageType(svg), null);
    assert.equal(sniffImageType(gif), null);
    assert.equal(sniffImageType(Buffer.from("not an image at all")), null);
    assert.equal(sniffImageType(JPEG.subarray(0, 8)), null);
  });

  console.log("local storage driver");
  const workDir = await mkdtemp(path.join(tmpdir(), "hucha-storage-"));
  const previousCwd = process.cwd();
  process.chdir(workDir);
  resetStorageForTests();
  try {
    const storage = getStorage();
    const url = await storage.put(PNG, "abc-123.webp", "image/webp");
    await check("put writes under public/uploads and returns /uploads path", async () => {
      assert.equal(url, "/uploads/abc-123.webp");
      const written = await stat(
        path.join(workDir, "public", "uploads", "abc-123.webp")
      );
      assert.ok(written.isFile());
    });
    await check("delete removes the stored object", async () => {
      await storage.delete(url);
      await assert.rejects(
        () => stat(path.join(workDir, "public", "uploads", "abc-123.webp"))
      );
    });
    await check("delete ignores non-uploads paths", async () => {
      await storage.delete("/etc/passwd");
      await storage.delete(null);
      await storage.delete("");
    });
    await check("delete refuses traversal attempts", async () => {
      const escapee = path.join(workDir, "secret.txt");
      await writeFile(escapee, "top secret");
      await storage.delete("/uploads/../secret.txt");
      await storage.delete("/uploads/%2e%2e/secret.txt");
      await assert.doesNotReject(() => stat(escapee));
    });
    await check("delete is idempotent for missing files", async () => {
      await storage.delete("/uploads/does-not-exist.webp");
    });
  } finally {
    process.chdir(previousCwd);
    resetStorageForTests();
    await rm(workDir, { recursive: true, force: true });
  }

  console.log("s3-compatible key resolution");
  // S3Storage only needs its config to construct (the client is created but
  // never contacted for key resolution); `keyFromUrl` is private, so access
  // it through a structural cast for this probe.
  const publicBase = "https://cdn.example.com/media/";
  const probe = new S3Storage({
    driver: "s3",
    region: "auto",
    bucket: "hucha-media",
    publicUrl: publicBase,
    forcePathStyle: true,
  });
  const keyOf = (
    probe as unknown as { keyFromUrl(url?: string | null): string }
  ).keyFromUrl.bind(probe);
  await check("strips trailing slash of STORAGE_PUBLIC_URL", async () => {
    assert.equal(keyOf(`${publicBase}products/x.webp`), "products/x.webp");
  });
  await check("ignores query strings on own URLs", async () => {
    assert.equal(
      keyOf(`${publicBase}products/x.webp?v=2`),
      "products/x.webp"
    );
  });
  await check("refuses absolute URLs from other domains", async () => {
    // A tampered/cross-domain path must never delete an object from this
    // bucket — only exact own-base matches resolve to a key.
    assert.equal(
      keyOf("https://other-bucket.s3.amazonaws.com/products/y.webp"),
      ""
    );
    assert.equal(keyOf("https://cdn.example.com.media.evil.io/products/x.webp"), "");
    assert.equal(keyOf("https://cdn.example.com/media2/x.webp"), "");
    assert.equal(keyOf("https://cdn.example.com/medi"), "");
    assert.equal(keyOf("not a url at all %"), "not a url at all %");
  });
  await check("resolves path-style endpoint/bucket URLs as own base", async () => {
    const pathProbe = new S3Storage({
      driver: "s3",
      region: "auto",
      bucket: "hucha-media",
      publicUrl: "https://cdn.example.com/media",
      endpoint: "https://s3.ap-southeast-1.amazonaws.com",
      forcePathStyle: true,
    });
    const keyOfPathStyle = (
      pathProbe as unknown as { keyFromUrl(url?: string | null): string }
    ).keyFromUrl.bind(pathProbe);
    assert.equal(
      keyOfPathStyle(
        "https://s3.ap-southeast-1.amazonaws.com/hucha-media/products/z.webp"
      ),
      "products/z.webp"
    );
    // The CDN base keeps working alongside the endpoint base.
    assert.equal(
      keyOfPathStyle("https://cdn.example.com/media/products/z.webp"),
      "products/z.webp"
    );
    // A sibling bucket on the same endpoint is NOT ours.
    assert.equal(
      keyOfPathStyle(
        "https://s3.ap-southeast-1.amazonaws.com/other-bucket/z.webp"
      ),
      ""
    );
  });
  await check("maps legacy local /uploads/ paths to bucket keys", async () => {
    assert.equal(keyOf("/uploads/legacy.webp"), "legacy.webp");
    assert.equal(keyOf("bare-key.webp"), "bare-key.webp");
    assert.equal(keyOf(""), "");
    assert.equal(keyOf(null), "");
  });

  console.log("product validation");
  await check("published requires a marketplace link and >= 1 image", () => {
    const base = {
      name: "Kampas Rem HuCha",
      categoryId: 1,
      status: "published" as const,
      images: [7],
      tokopediaUrl: "https://tokopedia.com/hucha/kampas",
    };
    assert.ok(productSchema.safeParse(base).success);
    const noLink = productSchema.safeParse({ ...base, tokopediaUrl: undefined });
    assert.equal(noLink.success, false);
    const noImages = productSchema.safeParse({ ...base, images: [] });
    assert.equal(noImages.success, false);
  });
  await check("caps gallery at 5 media ids", () => {
    const result = productSchema.safeParse({
      name: "Kampas Rem HuCha",
      categoryId: 1,
      status: "draft",
      images: [1, 2, 3, 4, 5, 6],
    });
    assert.equal(result.success, false);
    assert.ok(
      productSchema.safeParse({
        name: "Kampas Rem HuCha",
        categoryId: 1,
        status: "draft",
        images: [1, 2, 3, 4, 5],
      }).success
    );
  });

  console.log("form-data parsing helpers");
  await check("toNumberArray keeps only positive integers", () => {
    assert.deepEqual(toNumberArray("3,7,3"), [3, 7, 3]);
    assert.deepEqual(toNumberArray("1,x,-2,2.5,0"), [1]);
    assert.deepEqual(toNumberArray(""), []);
    assert.deepEqual(toNumberArray(null), []);
  });

  console.log(`\n${passed} checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

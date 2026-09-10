/**
 * Server-side image type detection by magic bytes (blueprint §26/§31/§32).
 * The client-supplied MIME header is untrusted, so the upload path verifies
 * the actual file content before assigning an extension — this prevents
 * MIME spoofing and stored-XSS vectors like SVG (which is not allowed).
 */

export type AllowedImageType = "image/jpeg" | "image/png" | "image/webp";

export const ALLOWED_IMAGE_TYPES: readonly AllowedImageType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const IMAGE_EXTENSION_BY_MIME: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Returns the detected image MIME type from the first bytes of the file, or
 * null when the content is not a supported image. `size` must be ≥ 16 bytes.
 */
export function sniffImageType(buffer: Uint8Array): AllowedImageType | null {
  if (buffer.length < 16) return null;

  const startsWith = (signature: number[], offset = 0) => {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[offset + i] !== signature[i]) return false;
    }
    return true;
  };

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  // RIFF container with a "WEBP" chunk header.
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }

  return null;
}

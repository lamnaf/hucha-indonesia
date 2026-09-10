import {
  PrismaClient,
} from "@/infrastructure/database/generated/client";
import { prisma as defaultPrisma } from "@/infrastructure/database/prisma";

export interface MediaInput {
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  folder?: string | null;
  width?: number | null;
  height?: number | null;
  uploadedById?: number | null;
}

/**
 * Internal storage-record repository. Media rows are created as a side effect
 * of direct uploads (feature forms, public CV submission) and referenced by
 * entity tables through FK — there is no admin-facing Media Library anymore.
 */
export class MediaRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  create(input: MediaInput) {
    return this.client.media.create({ data: input });
  }

  findById(id: number) {
    return this.client.media.findUnique({ where: { id } });
  }

  findByIds(ids: number[]) {
    return this.client.media.findMany({ where: { id: { in: ids } } });
  }

  /** Resolves a media row by its stored public URL/path (settings GC). */
  findByFilePath(filePath: string) {
    return this.client.media.findFirst({ where: { filePath } });
  }

  /**
   * Hard-deletes a media row and returns it. Callers must ensure the media is
   * no longer referenced: referencing FKs are `Restrict`, so Prisma surfaces
   * P2003 when another entity still uses the row (see releaseUnusedMedia for
   * the safe wrapper).
   */
  delete(id: number) {
    return this.client.media.delete({ where: { id } });
  }
}

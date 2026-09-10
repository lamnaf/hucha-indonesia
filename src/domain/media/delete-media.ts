import { MediaRepository } from "@/domain/media/media.repository";
import { getStorage } from "@/infrastructure/storage/storage";
import { DomainError, prismaErrorCode } from "@/domain/errors";
import { logAudit } from "@/domain/audit/log-audit";
import type { AdminFormState } from "@/domain/action-state";

/**
 * Releases media rows that are no longer referenced by any entity, keeping
 * the database and object storage consistent:
 *
 *   1. The DB row is deleted first. Referencing FKs (`ProductImage`, article
 *      cover, SEO OG image, brand/testimonial logo, application CV) are all
 *      `onDelete: Restrict`, so Prisma rejects the delete with P2003 while any
 *      other entity still uses the media — shared images are never removed.
 *   2. Only after the row is gone is the stored object deleted through the
 *      configured driver, so a storage failure can never leave a live record
 *      pointing at a missing file.
 *
 * Every failure mode is contained per-id: the function never throws, so a
 * best-effort cleanup cannot break the primary mutation that triggered it.
 */
export async function releaseUnusedMedia(
  mediaIds: number[],
  actorId: number | null = null
): Promise<void> {
  const repository = new MediaRepository();

  for (const id of mediaIds) {
    try {
      const media = await repository.findById(id);
      if (!media) continue;

      await repository.delete(id);

      await getStorage().delete(media.filePath).catch((error) => {
        // Row is already gone — a leftover object here is invisible to the
        // app; surface it server-side instead of failing the caller.
        console.error(
          `[media] release: storage delete failed for #${id} (${media.filePath})`,
          error
        );
      });
      await logAudit({
        userId: actorId,
        action: "delete",
        entityType: "media",
        entityId: String(id),
        meta: { filePath: media.filePath, releasedAsUnused: true },
      });
    } catch (error) {
      const code = error instanceof Error ? prismaErrorCode(error) : undefined;
      if (code === "P2003" || code === "P2025") {
        // P2003: still referenced by another entity — keep it.
        // P2025: someone else deleted it first — nothing to do.
        continue;
      }
      console.error(`[media] release: failed to release media #${id}`, error);
    }
  }
}

/**
 * Standard failure path for admin actions that upload images before their
 * primary mutation succeeds: rolls back every fresh upload from this request
 * (never throws), then converts the triggering error into an AdminFormState.
 * Unknown errors are re-thrown — only expected domain errors are surfaced.
 */
export async function failWithCleanup(
  error: unknown,
  uploadedIds: number[],
  actorId: number | null = null
): Promise<AdminFormState> {
  await releaseUnusedMedia(uploadedIds, actorId);
  if (error instanceof DomainError) {
    return { error: error.message };
  }
  throw error;
}

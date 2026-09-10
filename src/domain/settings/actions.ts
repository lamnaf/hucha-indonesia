"use server";

import { revalidatePath } from "next/cache";
import { SettingRepository } from "@/domain/settings/setting.repository";
import { MediaRepository } from "@/domain/media/media.repository";
import { storeUploadedImage } from "@/domain/media/upload-image";
import { releaseUnusedMedia } from "@/domain/media/delete-media";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { SETTINGS_GROUPS, type SettingsGroup } from "@/shared/validation/admin";
import { type AdminFormState } from "@/domain/action-state";

/**
 * Site settings server action (blueprint §18 #12, §16 settings).
 * Settings are JSONB key/value pairs; each group is validated by its own
 * Zod schema (shared with the client form — §31/§38). Image fields accept
 * direct uploads through `mediaFile:<field>` entries.
 */

/**
 * Checks whether any settings group still stores `filePath`. Settings hold
 * plain path strings instead of media FKs, so the database cannot protect
 * them with Restrict — this lookup guards a replaced image against deleting
 * an object another setting field/group still references.
 */
async function isPathReferencedInSettings(filePath: string): Promise<boolean> {
  const settings = await new SettingRepository().getAll();
  return settings.some((setting) =>
    JSON.stringify(setting.value ?? {}).includes(`"${filePath}"`)
  );
}

/** Saves a settings group. The form posts `group` + JSON-encoded `value`. */
export async function updateSettingsAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const actor = await requireAdmin();

  const groupValue = formData.get("group");
  if (typeof groupValue !== "string" || !(groupValue in SETTINGS_GROUPS)) {
    return { error: "Kelompok pengaturan tidak valid" };
  }
  const group = groupValue as SettingsGroup;
  // Only fields defined by the group schema may be written: entries outside
  // `value` or behind a mediaFile: prefix are ignored (no arbitrary object
  // injection, no orphaned uploads for bogus field names). Zod would strip
  // unknown keys anyway; this makes the boundary explicit and cheap.
  const allowedFields = Object.keys(SETTINGS_GROUPS[group].shape);

  const rawValue = formData.get("value");
  if (typeof rawValue !== "string") {
    return { error: "Nilai pengaturan tidak valid" };
  }

  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch {
    return { error: "Nilai pengaturan tidak valid" };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { error: "Nilai pengaturan tidak valid" };
  }
  const incoming = value as Record<string, unknown>;
  const record: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in incoming) record[field] = incoming[field];
  }

  // Current stored value, used to detect images replaced/cleared by this save.
  const current = await new SettingRepository().get<Record<string, unknown>>(group);

  // Direct uploads: entries named `mediaFile:<field>` carry the picked image
  // files; each stored file path replaces the field's string value before
  // validation so settings keep storing plain URL strings.
  const uploadedIds: number[] = [];
  for (const [key, entry] of formData.entries()) {
    if (!key.startsWith("mediaFile:")) continue;
    const field = key.slice("mediaFile:".length);
    if (!allowedFields.includes(field)) continue;
    if (!(entry instanceof File) || entry.size === 0) continue;
    const stored = await storeUploadedImage(entry, actor.id);
    if (typeof stored === "string") {
      await releaseUnusedMedia(uploadedIds, actor.id);
      return { error: stored };
    }
    uploadedIds.push(stored.id);
    record[field] = stored.filePath;
  }

  const parsed = SETTINGS_GROUPS[group].safeParse(record);
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, actor.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data pengaturan tidak valid",
    };
  }

  // Media rows behind setting images that this save replaced or cleared. The
  // row is released only after the new value is committed and only if no
  // other setting still points at the same path (see isPathReferencedInSettings).
  const replacedMediaIds = new Set<number>();
  const mediaRepository = new MediaRepository();
  for (const field of allowedFields) {
    if (!(field in record)) continue;
    const oldValue = current?.[field];
    if (typeof oldValue !== "string" || oldValue === "") continue;
    if (record[field] === oldValue) continue;
    const media = await mediaRepository.findByFilePath(oldValue);
    if (media && !(await isPathReferencedInSettings(media.filePath))) {
      replacedMediaIds.add(media.id);
    }
  }

  try {
    await new SettingRepository().set(group, parsed.data);
  } catch (error) {
    await releaseUnusedMedia(uploadedIds, actor.id);
    throw error;
  }
  await releaseUnusedMedia([...replacedMediaIds], actor.id);
  await logAudit({
    userId: actor.id,
    action: "update",
    entityType: "setting",
    entityId: group,
    meta: { key: group },
  });

  revalidatePath("/admin/settings");
  return { success: "Pengaturan berhasil disimpan" };
}

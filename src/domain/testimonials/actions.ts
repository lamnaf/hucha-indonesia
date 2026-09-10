"use server";

import { revalidatePath } from "next/cache";
import { TestimonialRepository } from "@/domain/testimonials/testimonial.repository";
import { MediaRepository } from "@/domain/media/media.repository";
import { resolveImageInput, type ResolvedImage } from "@/domain/media/upload-image";
import { releaseUnusedMedia, failWithCleanup } from "@/domain/media/delete-media";
import { logAudit } from "@/domain/audit/log-audit";
import { requireAdmin } from "@/domain/auth/guards";
import { testimonialSchema } from "@/shared/validation/testimonial";
import { type AdminFormState } from "@/domain/action-state";
import { toOptionalNumber, toOptionalString } from "@/domain/action-utils";

/**
 * Testimonial admin server actions (blueprint §29 testimonials).
 * All mutations require `testimonials.manage` and write an audit entry (§32).
 */

function parseTestimonialForm(formData: FormData) {
  return {
    partnerName: formData.get("partnerName"),
    partnerBusiness: toOptionalString(formData.get("partnerBusiness")),
    partnerRegion: toOptionalString(formData.get("partnerRegion")),
    quote: formData.get("quote"),
    partnerLogoMediaId: toOptionalNumber(formData.get("partnerLogoMediaId")),
    rating: toOptionalNumber(formData.get("rating")),
    isPublished: formData.get("isPublished") === "on",
  };
}

async function validateTestimonialReferences(
  partnerLogoMediaId: number | null | undefined
): Promise<string | null> {
  if (!partnerLogoMediaId) return null;
  const media = await new MediaRepository().findById(partnerLogoMediaId);
  if (!media) {
    return "Logo media yang dipilih tidak ditemukan";
  }
  if (!media.mimeType.startsWith("image/")) {
    return "Logo harus berupa berkas gambar";
  }
  return null;
}

/**
 * Resolves the partner logo from the direct-upload form fields. A newly
 * picked file is stored and wins; an empty hidden id clears the reference;
 * otherwise the kept id passes through. `uploadedId` (when set) must be
 * released via releaseUnusedMedia if a later step of the action fails.
 * Returns an error message string on failure.
 */
async function resolvePartnerLogo(
  formData: FormData,
  userId: number
): Promise<ResolvedImage | string> {
  return resolveImageInput(formData, {
    fileField: "partnerLogo",
    idField: "partnerLogoMediaId",
    userId,
  });
}

function applyTestimonialRevalidation() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimoni");
  revalidatePath("/tentang-kami");
  revalidatePath("/kemitraan");
  revalidatePath("/");
}

export async function createTestimonialAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const logo = await resolvePartnerLogo(formData, user.id);
  if (typeof logo === "string") {
    return { error: logo };
  }
  const uploadedIds = logo.uploadedId ? [logo.uploadedId] : [];

  const parsed = testimonialSchema.safeParse({
    ...parseTestimonialForm(formData),
    partnerLogoMediaId: logo.mediaId,
  });
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data testimoni tidak valid",
    };
  }

  const refError = await validateTestimonialReferences(
    parsed.data.partnerLogoMediaId
  );
  if (refError) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: refError };
  }

  const testimonial = await new TestimonialRepository().create(parsed.data);
  await logAudit({
    userId: user.id,
    action: "create",
    entityType: "testimonial",
    entityId: String(testimonial.id),
    meta: { partnerName: parsed.data.partnerName },
  });

  applyTestimonialRevalidation();
  return { success: "Testimoni berhasil dibuat" };
}

export async function updateTestimonialAction(
  id: number,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const user = await requireAdmin();

  const logo = await resolvePartnerLogo(formData, user.id);
  if (typeof logo === "string") {
    return { error: logo };
  }
  const uploadedIds = logo.uploadedId ? [logo.uploadedId] : [];

  const parsed = testimonialSchema.safeParse({
    ...parseTestimonialForm(formData),
    partnerLogoMediaId: logo.mediaId,
  });
  if (!parsed.success) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return {
      error: parsed.error.issues[0]?.message ?? "Data testimoni tidak valid",
    };
  }

  const repository = new TestimonialRepository();
  const existing = await repository.findById(id);
  if (!existing) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: "Testimoni tidak ditemukan" };
  }

  const refError = await validateTestimonialReferences(
    parsed.data.partnerLogoMediaId
  );
  if (refError) {
    await releaseUnusedMedia(uploadedIds, user.id);
    return { error: refError };
  }

  try {
    await repository.update(id, parsed.data);
  } catch (error) {
    return failWithCleanup(error, uploadedIds, user.id);
  }
  // Release the replaced logo; Restrict FKs keep it alive if anything else
  // (e.g. a concurrent edit) still references it.
  if (
    existing.partnerLogoMediaId &&
    existing.partnerLogoMediaId !== parsed.data.partnerLogoMediaId
  ) {
    await releaseUnusedMedia([existing.partnerLogoMediaId], user.id);
  }
  await logAudit({
    userId: user.id,
    action: "update",
    entityType: "testimonial",
    entityId: String(id),
  });

  applyTestimonialRevalidation();
  return { success: "Testimoni berhasil diperbarui" };
}

export async function setTestimonialPublishedAction(
  id: number,
  isPublished: boolean
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new TestimonialRepository().setPublished(id, isPublished);
  await logAudit({
    userId: user.id,
    action: isPublished ? "publish" : "update",
    entityType: "testimonial",
    entityId: String(id),
  });

  applyTestimonialRevalidation();
  return {
    success: isPublished ? "Testimoni diterbitkan" : "Testimoni ditarik",
  };
}

export async function deleteTestimonialAction(
  id: number
): Promise<AdminFormState> {
  const user = await requireAdmin();

  await new TestimonialRepository().softDelete(id);
  await logAudit({
    userId: user.id,
    action: "delete",
    entityType: "testimonial",
    entityId: String(id),
  });

  applyTestimonialRevalidation();
  return { success: "Testimoni dihapus" };
}

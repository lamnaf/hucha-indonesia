"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { JobRepository } from "@/domain/jobs/job.repository";
import { ApplicationRepository } from "@/domain/jobs/application.repository";
import { MediaRepository } from "@/domain/media/media.repository";
import { getStorage } from "@/infrastructure/storage/storage";
import { applicationSchema } from "@/shared/validation/job";
import {
  isPublicSubmitRateLimited,
  recordPublicSubmit,
} from "@/shared/public-submit-rate-limit";
import {
  PUBLIC_SUBMIT_SUCCESS,
  PUBLIC_SUBMIT_UNEXPECTED,
  type PublicSubmitResult,
} from "@/shared/public-submit-result";
import { notifyApplicationCreated } from "@/domain/notifications/notification.service";

/**
 * Public job-application submission (FR-07 / §24). The CV file is sniffed
 * by magic bytes (pdf/doc/docx), written through the configured storage
 * driver (local filesystem in dev, S3-compatible object storage on
 * serverless deploys), registered as a media row, then the application is
 * stored via ApplicationRepository. Public (no `requirePermission`), with
 * honeypot + per-IP rate limiting like the lead actions.
 */

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (§24)

interface CvType {
  mime: string;
  ext: string;
}

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isHoneypotFilled(formData: FormData): boolean {
  return getString(formData, "website").trim().length > 0;
}

/** CV type detection from magic bytes — never trusts the client MIME header. */
function sniffCvType(buffer: Buffer): CvType | null {
  if (
    buffer.length >= 5 &&
    buffer.subarray(0, 5).toString("latin1") === "%PDF-"
  ) {
    return { mime: "application/pdf", ext: "pdf" };
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1"
  ) {
    return { mime: "application/msword", ext: "doc" };
  }
  if (
    buffer.length >= 4 &&
    buffer.subarray(0, 4).toString("hex") === "504b0304"
  ) {
    return {
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ext: "docx",
    };
  }
  return null;
}

export async function submitJobApplicationAction(
  formData: FormData
): Promise<PublicSubmitResult> {
  try {
    if (isHoneypotFilled(formData)) {
      return PUBLIC_SUBMIT_SUCCESS;
    }

    const requestHeaders = await headers();
    if (isPublicSubmitRateLimited(requestHeaders, "application")) {
      return {
        ok: false,
        error: "Terlalu banyak kiriman. Silakan coba lagi beberapa saat.",
      };
    }

    const rawJobId = getString(formData, "jobId");
    const jobId = Number(rawJobId);
    const job =
      Number.isInteger(jobId) && jobId > 0
        ? await new JobRepository().findById(jobId)
        : null;
    if (!job) {
      return {
        ok: false,
        error: "Posisi lowongan tidak ditemukan.",
      };
    }
    if (job.status !== "open") {
      return {
        ok: false,
        error: "Lowongan ini sudah ditutup dan tidak menerima lamaran baru.",
      };
    }

    const core = applicationSchema.omit({ jobId: true, cvMediaId: true });
    const parsed = await core.safeParseAsync({
      fullName: getString(formData, "fullName"),
      email: getString(formData, "email"),
      phone: getString(formData, "phone"),
      coverNote: getString(formData, "coverNote"),
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) {
          errors[key] = issue.message;
        }
      }
      return { ok: false, errors };
    }

    const file = formData.get("cv");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, errors: { cv: "Unggah CV wajib diisi" } };
    }
    if (file.size > MAX_CV_SIZE_BYTES) {
      return { ok: false, errors: { cv: "Ukuran CV maksimal 5MB" } };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvType = sniffCvType(buffer);
    if (!cvType) {
      return {
        ok: false,
        errors: { cv: "Format CV harus PDF, DOC, atau DOCX" },
      };
    }

    const storedName = `${randomUUID()}.${cvType.ext}`;
    let filePath: string;
    try {
      filePath = await getStorage().put(
        buffer,
        `cv/${storedName}`,
        cvType.mime
      );
    } catch {
      return { ok: false, errors: { cv: "Gagal mengunggah CV. Coba lagi." } };
    }

    let media;
    try {
      media = await new MediaRepository().create({
        fileName: file.name,
        filePath,
        mimeType: cvType.mime,
        sizeBytes: file.size,
      });
    } catch {
      // Media row failed — remove the just-written object so no orphan stays.
      await getStorage().delete(filePath).catch(() => {});
      throw new Error("cv_media_insert_failed");
    }

    try {
      await new ApplicationRepository().create({
        jobId: job.id,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        cvMediaId: media.id,
        coverNote: parsed.data.coverNote || null,
      });
    } catch (error) {
      // Application failed before referencing the CV — roll back this
      // request's media row and object (nothing else can reference them yet).
      await new MediaRepository().delete(media.id).catch(() => {});
      await getStorage().delete(filePath).catch(() => {});
      throw error;
    }

    recordPublicSubmit(requestHeaders, "application");

    // Best-effort notification (§29) — AFTER the DB write so a delivery
    // failure can never lose the application. Never awaited to block.
    void notifyApplicationCreated({
      jobTitle: job.title,
      applicantName: parsed.data.fullName,
    });
    return PUBLIC_SUBMIT_SUCCESS;
  } catch {
    return PUBLIC_SUBMIT_UNEXPECTED;
  }
}

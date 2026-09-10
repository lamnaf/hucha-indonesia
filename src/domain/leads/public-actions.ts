"use server";

import { headers } from "next/headers";
import { LeadRepository } from "@/domain/leads/lead.repository";
import {
  contactLeadSchema,
  distributorLeadSchema,
  oemLeadSchema,
} from "@/shared/validation/lead";
import type { ZodType } from "zod";
import {
  isPublicSubmitRateLimited,
  recordPublicSubmit,
} from "@/shared/public-submit-rate-limit";
import {
  PUBLIC_SUBMIT_SUCCESS,
  PUBLIC_SUBMIT_UNEXPECTED,
  type PublicSubmitResult,
} from "@/shared/public-submit-result";
import { notifyLeadCreated } from "@/domain/notifications/notification.service";

/**
 * Public lead-capture server actions (FR-05 / FR-06 / FR-09, §36 POST
 * /api/leads/*). These are the real persistence path for the public
 * contact, distributor and OEM forms — Phase 5 wiring. They are public
 * (no `requirePermission`), enforce a honeypot and a per-IP rate limit,
 * validate with the shared Zod schemas, and store via LeadRepository.
 */

const CONTACT_FIELDS = ["fullName", "email", "message"] as const;
const DISTRIBUTOR_FIELDS = [
  "fullName",
  "region",
  "whatsapp",
  "businessType",
] as const;
const OEM_FIELDS = [
  "companyName",
  "picName",
  "whatsapp",
  "email",
  "categoryOfInterest",
  "message",
] as const;

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Hidden honeypot trap: a filled-in `website` field means a bot. */
function isHoneypotFilled(formData: FormData): boolean {
  return getString(formData, "website").trim().length > 0;
}

type FieldIssue = { path: PropertyKey[]; message: string };

function fieldErrors(
  issues: FieldIssue[],
  fields: readonly string[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (fields.includes(key) && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

async function submitLead(
  formData: FormData,
  kind: "contact" | "distributor" | "oem",
  schema: ZodType,
  fields: readonly string[],
  sourcePage: string
): Promise<PublicSubmitResult> {
  try {
    if (isHoneypotFilled(formData)) {
      return PUBLIC_SUBMIT_SUCCESS;
    }

    const requestHeaders = await headers();
    if (isPublicSubmitRateLimited(requestHeaders, kind)) {
      return {
        ok: false,
        error: "Terlalu banyak kiriman. Silakan coba lagi beberapa saat.",
      };
    }

    const values: Record<string, string> = {};
    for (const field of fields) {
      values[field] = getString(formData, field).trim();
    }
    values.sourcePage = sourcePage;

    const parsed = await schema.safeParseAsync(values);
    if (!parsed.success) {
      return { ok: false, errors: fieldErrors(parsed.error.issues, fields) };
    }

    const input = parsed.data as {
      fullName: string;
      companyName?: string;
      region?: string;
      whatsapp?: string;
      email?: string;
      message?: string;
      categoryOfInterest?: string;
      businessType?: string;
      sourcePage?: string;
    };

    const typeByKind = {
      contact: "contact",
      distributor: "distributor",
      oem: "oem",
    } as const;

    const created = await new LeadRepository().create(typeByKind[kind], {
      fullName: input.fullName,
      companyName: input.companyName || null,
      region: input.region || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      message: input.message || null,
      categoryOfInterest: input.categoryOfInterest || null,
      sourcePage: input.sourcePage || null,
    });

    recordPublicSubmit(requestHeaders, kind);

    // Best-effort notification (§29) — AFTER the DB write so a delivery
    // failure can never lose the lead. Never awaited to block the response.
    void notifyLeadCreated({
      type: kind,
      fullName: created.fullName,
      companyName: created.companyName,
      region: created.region,
    });
    return PUBLIC_SUBMIT_SUCCESS;
  } catch {
    return PUBLIC_SUBMIT_UNEXPECTED;
  }
}

export async function submitContactLeadAction(
  formData: FormData
): Promise<PublicSubmitResult> {
  return submitLead(
    formData,
    "contact",
    contactLeadSchema,
    CONTACT_FIELDS,
    "/kontak"
  );
}

export async function submitDistributorLeadAction(
  formData: FormData
): Promise<PublicSubmitResult> {
  return submitLead(
    formData,
    "distributor",
    distributorLeadSchema,
    DISTRIBUTOR_FIELDS,
    "/kemitraan"
  );
}

export async function submitOemLeadAction(
  formData: FormData
): Promise<PublicSubmitResult> {
  return submitLead(formData, "oem", oemLeadSchema, OEM_FIELDS, "/oem");
}

"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, StarIcon } from "lucide-react";

import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/domain/testimonials/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export interface TestimonialFormProps {
  /** URL of the persisted partner logo for edit-mode preview. */
  initialLogoUrl?: string | null;
  initial?: {
    id: number;
    partnerName: string;
    partnerBusiness: string | null;
    partnerRegion: string | null;
    quote: string;
    partnerLogoMediaId: number | null;
    rating: number | null;
    isPublished: boolean;
  };
}

export function TestimonialForm({ initialLogoUrl, initial }: TestimonialFormProps) {
  const isEdit = Boolean(initial);
  const [logoKept, setLogoKept] = React.useState(
    initial?.partnerLogoMediaId ? String(initial.partnerLogoMediaId) : ""
  );
  const [rating, setRating] = React.useState<number>(initial?.rating ?? 5);

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(
        prev: typeof EMPTY_FORM_STATE,
        formData: FormData
      ) {
        formData.set("rating", String(rating));
        if (isEdit && initial) {
          return updateTestimonialAction(initial.id, prev, formData);
        }
        return createTestimonialAction(prev, formData);
      },
      [rating, isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/testimonials">
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Kembali ke daftar testimoni
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit Testimoni" : "Testimoni Baru"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Kelola testimoni partner yang tampil pada halaman publik.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Partner</h2>
          <Field label="Nama Partner" htmlFor="testimonial-name" required>
            <Input
              id="testimonial-name"
              name="partnerName"
              defaultValue={initial?.partnerName}
              placeholder="Contoh: PT Sinar Abadi Motor"
              required
            />
          </Field>
          <Field label="Perusahaan / Bisnis" htmlFor="testimonial-business">
            <Input
              id="testimonial-business"
              name="partnerBusiness"
              defaultValue={initial?.partnerBusiness ?? ""}
              placeholder="Contoh: Bengkel & Distributor Sparepart"
            />
          </Field>
          <Field label="Wilayah" htmlFor="testimonial-region">
            <Input
              id="testimonial-region"
              name="partnerRegion"
              defaultValue={initial?.partnerRegion ?? ""}
              placeholder="Contoh: Bekasi"
            />
          </Field>
          <Field label="Kutipan" htmlFor="testimonial-quote" required>
            <Textarea
              id="testimonial-quote"
              name="quote"
              defaultValue={initial?.quote}
              rows={5}
              placeholder="Kutipan ulasan dari partner..."
              required
            />
          </Field>
          <Field label="Rating" hint="1 sampai 5 bintang.">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`cursor-pointer rounded p-1 transition-colors ${
                    value <= rating
                      ? "text-amber-500"
                      : "text-muted-foreground/30 hover:text-muted-foreground/60"
                  }`}
                  aria-label={`${value} bintang`}
                >
                  <StarIcon
                    className="size-6"
                    fill={value <= rating ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <span className="text-muted-foreground ml-2 text-sm">
                {rating}/5
              </span>
            </div>
          </Field>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initial?.isPublished ?? false}
              className="accent-primary size-4"
            />
            Terbit (ditampilkan di halaman publik)
          </label>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Logo Partner</h2>
          <ImageUploadField
            name="partnerLogo"
            hiddenName="partnerLogoMediaId"
            keptValue={logoKept}
            onKeptValueChange={setLogoKept}
            currentUrl={initialLogoUrl}
            label="Logo"
            hint="JPEG, PNG, atau WebP — maksimal 10 MB. Dioptimalkan otomatis menjadi WebP."
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <FormStatus state={state} />
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/testimonials">Batal</Link>
          </Button>
          <SubmitButton pending={pending}>
            {isEdit ? "Simpan Perubahan" : "Buat Testimoni"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

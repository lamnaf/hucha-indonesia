"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { Select } from "radix-ui";

import { createBrandAction, updateBrandAction } from "@/domain/brands/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_TYPE_LABELS } from "@/lib/admin";
import type { CategoryType } from "@/infrastructure/database/generated/client";

export interface BrandFormProps {
  /** URL of the persisted logo for edit-mode preview. */
  initialLogoUrl?: string | null;
  initial?: {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    category: CategoryType;
    logoMediaId: number | null;
    highlights: string[];
    sortOrder: number;
    isPublished: boolean;
  };
}

export function BrandForm({ initialLogoUrl, initial }: BrandFormProps) {
  const isEdit = Boolean(initial);
  const [logoKept, setLogoKept] = React.useState(
    initial?.logoMediaId ? String(initial.logoMediaId) : ""
  );

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(
        prev: typeof EMPTY_FORM_STATE,
        formData: FormData
      ) {
        if (isEdit && initial) {
          return updateBrandAction(initial.id, prev, formData);
        }
        return createBrandAction(prev, formData);
      },
      [isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/brands">
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Kembali ke daftar merek
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit Merek" : "Merek Baru"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Kelola lini merek yang ditampilkan pada halaman Merek Kami.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Informasi Merek</h2>
          <Field label="Nama Merek" htmlFor="brand-name" required>
            <Input
              id="brand-name"
              name="name"
              defaultValue={initial?.name}
              placeholder="Contoh: HuCha Racing"
              required
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="brand-slug"
            hint="Kosongkan untuk dibuat otomatis dari nama."
          >
            <Input
              id="brand-slug"
              name="slug"
              defaultValue={initial?.slug}
              placeholder="hucha-racing"
            />
          </Field>
          <Field label="Tagline" htmlFor="brand-tagline">
            <Input
              id="brand-tagline"
              name="tagline"
              defaultValue={initial?.tagline ?? ""}
              placeholder="Performa untuk jalanan & lintasan"
            />
          </Field>
          <Field label="Deskripsi" htmlFor="brand-description">
            <Textarea
              id="brand-description"
              name="description"
              defaultValue={initial?.description ?? ""}
              rows={4}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" htmlFor="brand-category" required>
              <Select.Root
                name="category"
                defaultValue={initial?.category ?? "spareparts"}
              >
                <SelectTrigger id="brand-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_TYPE_LABELS) as CategoryType[]).map(
                    (categoryType) => (
                      <SelectItem key={categoryType} value={categoryType}>
                        {CATEGORY_TYPE_LABELS[categoryType]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select.Root>
            </Field>
            <Field label="Urutan" htmlFor="brand-sort">
              <Input
                id="brand-sort"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={initial?.sortOrder ?? 0}
              />
            </Field>
          </div>
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
          <h2 className="font-semibold">Logo & Keunggulan</h2>
          <ImageUploadField
            name="logo"
            hiddenName="logoMediaId"
            keptValue={logoKept}
            onKeptValueChange={setLogoKept}
            currentUrl={initialLogoUrl}
            label="Logo Merek"
            hint="JPEG, PNG, atau WebP — maksimal 10 MB. Dioptimalkan otomatis menjadi WebP."
            disabled={pending}
          />
          <Field
            label="Keunggulan"
            htmlFor="brand-highlights"
            hint="Satu poin per baris, maksimal 10."
          >
            <Textarea
              id="brand-highlights"
              name="highlights"
              defaultValue={(initial?.highlights ?? []).join("\n")}
              rows={5}
              placeholder={"Material non-asbestos\nTahan panas tinggi\nCocok harian & balap"}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <FormStatus state={state} />
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/brands">Batal</Link>
          </Button>
          <SubmitButton pending={pending}>
            {isEdit ? "Simpan Perubahan" : "Buat Merek"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

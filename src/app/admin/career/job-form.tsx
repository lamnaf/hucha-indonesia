"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { BriefcaseIcon, ChevronLeftIcon } from "lucide-react";
import { Select } from "radix-ui";

import { createJobAction, updateJobAction } from "@/domain/jobs/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employmentTypeLabel, jobStatusLabel } from "@/lib/admin";

export interface JobFormProps {
  initial?: {
    id: number;
    title: string;
    slug: string;
    department: string | null;
    location: string | null;
    employmentType: string | null;
    description: string | null;
    requirements: string | null;
    status: "open" | "closed";
  };
}

export function JobForm({ initial }: JobFormProps) {
  const isEdit = Boolean(initial);

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(
        prev: typeof EMPTY_FORM_STATE,
        formData: FormData
      ) {
        if (isEdit && initial) {
          return updateJobAction(initial.id, prev, formData);
        }
        return createJobAction(prev, formData);
      },
      [isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/career">
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Kembali ke daftar lowongan
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit Lowongan" : "Lowongan Baru"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Kelola lowongan pekerjaan yang ditampilkan pada halaman Karir.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Informasi Lowongan</h2>
          <Field label="Judul Posisi" htmlFor="job-title" required>
            <Input
              id="job-title"
              name="title"
              defaultValue={initial?.title}
              placeholder="Contoh: Sales Executive Area"
              required
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="job-slug"
            hint="Kosongkan untuk dibuat otomatis dari judul."
          >
            <Input
              id="job-slug"
              name="slug"
              defaultValue={initial?.slug}
              placeholder="sales-executive-area"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Departemen" htmlFor="job-department">
              <Input
                id="job-department"
                name="department"
                defaultValue={initial?.department ?? ""}
                placeholder="Penjualan"
              />
            </Field>
            <Field label="Lokasi" htmlFor="job-location">
              <Input
                id="job-location"
                name="location"
                defaultValue={initial?.location ?? ""}
                placeholder="Jakarta"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipe Pekerjaan" htmlFor="job-type">
              <Select.Root
                name="employmentType"
                defaultValue={initial?.employmentType ?? "full_time"}
              >
                <SelectTrigger id="job-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["full_time", "part_time", "contract", "internship"].map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {employmentTypeLabel(type)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select.Root>
            </Field>
            <Field label="Status" htmlFor="job-status">
              <Select.Root
                name="status"
                defaultValue={initial?.status ?? "open"}
              >
                <SelectTrigger id="job-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["open", "closed"] as const).map((status) => (
                    <SelectItem key={status} value={status}>
                      {jobStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </Field>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Deskripsi & Persyaratan</h2>
          <Field
            label="Deskripsi Pekerjaan"
            htmlFor="job-description"
            hint="Minimal 20 karakter."
          >
            <Textarea
              id="job-description"
              name="description"
              defaultValue={initial?.description ?? ""}
              rows={10}
              required
            />
          </Field>
          <Field
            label="Persyaratan"
            htmlFor="job-requirements"
            hint="Minimal 20 karakter."
          >
            <Textarea
              id="job-requirements"
              name="requirements"
              defaultValue={initial?.requirements ?? ""}
              rows={8}
              required
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <FormStatus state={state} />
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/career">Batal</Link>
          </Button>
          <SubmitButton pending={pending}>
            <BriefcaseIcon className="size-4" aria-hidden="true" />
            {isEdit ? "Simpan Perubahan" : "Buat Lowongan"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

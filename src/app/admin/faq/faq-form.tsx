"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { Select } from "radix-ui";

import { createFaqAction, updateFaqAction } from "@/domain/faqs/actions";
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

export interface FaqFormProps {
  categories: { id: number; name: string }[];
  initial?: {
    id: number;
    faqCategoryId: number;
    question: string;
    answer: string;
    sortOrder: number;
    isPublished: boolean;
  };
}

export function FaqForm({ categories, initial }: FaqFormProps) {
  const isEdit = Boolean(initial);
  const [categoryId, setCategoryId] = React.useState<number | null>(
    initial?.faqCategoryId ?? null
  );

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(prev: typeof EMPTY_FORM_STATE, formData: FormData) {
        if (categoryId) formData.set("faqCategoryId", String(categoryId));
        if (isEdit && initial) {
          return updateFaqAction(initial.id, prev, formData);
        }
        return createFaqAction(prev, formData);
      },
      [categoryId, isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/faq">
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            Kembali ke daftar FAQ
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit FAQ" : "FAQ Baru"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Pertanyaan yang tampil di halaman FAQ publik.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Pertanyaan & Jawaban</h2>
        <Field label="Kategori" htmlFor="faq-category" required>
          <Select.Root
            value={categoryId ? String(categoryId) : undefined}
            onValueChange={(value) => setCategoryId(Number(value))}
          >
            <SelectTrigger id="faq-category" className="w-full">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select.Root>
        </Field>
        <Field label="Pertanyaan" htmlFor="faq-question" required>
          <Input
            id="faq-question"
            name="question"
            defaultValue={initial?.question}
            placeholder="Contoh: Bagaimana cara menjadi distributor?"
            required
          />
        </Field>
        <Field label="Jawaban" htmlFor="faq-answer" required>
          <Textarea
            id="faq-answer"
            name="answer"
            defaultValue={initial?.answer}
            rows={6}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Urutan"
            htmlFor="faq-sort"
            hint="Lebih kecil tampil lebih dulu."
          >
            <Input
              id="faq-sort"
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

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <FormStatus state={state} />
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/faq">Batal</Link>
          </Button>
          <SubmitButton pending={pending}>
            {isEdit ? "Simpan Perubahan" : "Buat FAQ"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

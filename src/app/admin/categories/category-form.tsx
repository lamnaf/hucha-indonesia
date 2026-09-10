"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { Select } from "radix-ui";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/domain/products/category-actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { Modal } from "@/components/ui/modal";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_TYPE_LABELS } from "@/lib/admin";
import type { CategoryType } from "@/infrastructure/database/generated/client";

export interface CategoryFormCategory {
  id: number;
  name: string;
  type: CategoryType;
}

export interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryFormCategory[];
  initial?: {
    id: number;
    name: string;
    slug: string;
    type: CategoryType;
    parentId: number | null;
  };
  title: string;
  description: string;
}

export function CategoryForm({
  open,
  onOpenChange,
  categories,
  initial,
  title,
  description,
}: CategoryFormProps) {
  const isEdit = Boolean(initial);

  const [type, setType] = React.useState<CategoryType>(
    initial?.type ?? "spareparts"
  );
  const [parent, setParent] = React.useState(
    initial?.parentId ? String(initial.parentId) : ""
  );

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? "spareparts");
    setParent(initial?.parentId ? String(initial.parentId) : "");
  }, [open, initial]);

  const parentOptions = categories.filter((category) => category.type === type);

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(
        prev: typeof EMPTY_FORM_STATE,
        formData: FormData
      ) {
        if (isEdit && initial) {
          return updateCategoryAction(initial.id, prev, formData);
        }
        return createCategoryAction(prev, formData);
      },
      [isEdit, initial]
    ),
    EMPTY_FORM_STATE
  );

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <form action={formAction} className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama" htmlFor={`category-name-${isEdit ? "edit" : "new"}`} required>
            <Input
              id={`category-name-${isEdit ? "edit" : "new"}`}
              name="name"
              defaultValue={initial?.name}
              placeholder="Contoh: Oli Mesin"
              required
            />
          </Field>
          <Field
            label="Slug"
            htmlFor={`category-slug-${isEdit ? "edit" : "new"}`}
            hint="Kosongkan untuk dibuat otomatis."
          >
            <Input
              id={`category-slug-${isEdit ? "edit" : "new"}`}
              name="slug"
              defaultValue={initial?.slug}
              placeholder="oli-mesin"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipe" htmlFor="category-type" required>
            <Select.Root
              name="type"
              value={type}
              onValueChange={(value) => {
                setType(value as CategoryType);
                setParent("");
              }}
            >
              <SelectTrigger id="category-type" className="w-full">
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
          <Field
            label="Kategori Induk"
            htmlFor="category-parent"
            hint="Sub-kategori bila diisi (maksimal 2 tingkat)."
          >
            <Select.Root
              name="parentId"
              value={parent}
              onValueChange={setParent}
            >
              <SelectTrigger id="category-parent" className="w-full">
                <SelectValue placeholder="Tanpa induk" />
              </SelectTrigger>
              <SelectContent>
                {parentOptions.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select.Root>
          </Field>
        </div>
        <FormStatus state={state} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <SubmitButton pending={pending}>
            {isEdit ? "Simpan Perubahan" : "Buat Kategori"}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

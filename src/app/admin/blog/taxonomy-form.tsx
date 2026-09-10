"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";

import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";
import { Modal } from "@/components/ui/modal";

export interface TaxonomyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createAction: (
    prev: typeof EMPTY_FORM_STATE,
    formData: FormData
  ) => Promise<typeof EMPTY_FORM_STATE>;
  updateAction: (
    id: number,
    prev: typeof EMPTY_FORM_STATE,
    formData: FormData
  ) => Promise<typeof EMPTY_FORM_STATE>;
  initial?: { id: number; name: string; slug: string };
  title: string;
  description: string;
}

/**
 * Shared modal form for simple name+slug records (blog categories, tags).
 * The create/update server actions are passed in by the calling page.
 */
export function TaxonomyForm({
  open,
  onOpenChange,
  createAction,
  updateAction,
  initial,
  title,
  description,
}: TaxonomyFormProps) {
  const isEdit = Boolean(initial);

  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async function submit(
        prev: typeof EMPTY_FORM_STATE,
        formData: FormData
      ) {
        if (isEdit && initial) {
          return updateAction(initial.id, prev, formData);
        }
        return createAction(prev, formData);
      },
      [isEdit, initial, createAction, updateAction]
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
        <Field label="Nama" htmlFor="taxonomy-name" required>
          <Input
            id="taxonomy-name"
            name="name"
            defaultValue={initial?.name}
            required
          />
        </Field>
        <Field
          label="Slug"
          htmlFor="taxonomy-slug"
          hint="Kosongkan untuk dibuat otomatis dari nama."
        >
          <Input
            id="taxonomy-slug"
            name="slug"
            defaultValue={initial?.slug}
          />
        </Field>
        <FormStatus state={state} />
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <SubmitButton pending={pending}>
            {isEdit ? "Simpan Perubahan" : "Buat"}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { useActionState } from "react";

import { addLeadNoteAction } from "@/domain/leads/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { SubmitButton } from "@/components/admin/form-fields";
import { FormStatus } from "@/components/admin/form-status";

export interface LeadNoteFormProps {
  leadId: number;
}

export function LeadNoteForm({ leadId }: LeadNoteFormProps) {
  const [state, formAction, pending] = useActionState(
    React.useCallback(
      async (prev: typeof EMPTY_FORM_STATE, formData: FormData) =>
        addLeadNoteAction(leadId, prev, formData),
      [leadId]
    ),
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="grid gap-3">
      <label htmlFor="lead-note" className="text-sm">
        <span className="text-muted-foreground mb-1 block text-xs">
          Catatan tindak lanjut
        </span>
        <textarea
          id="lead-note"
          name="note"
          required
          rows={3}
          placeholder="Tulis catatan untuk tim (mis. sudah dihubungi, menunggu konfirmasi)..."
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
        />
      </label>
      <FormStatus state={state} />
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingText="Menyimpan...">
          Tambah Catatan
        </SubmitButton>
      </div>
    </form>
  );
}

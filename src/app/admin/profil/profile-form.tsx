"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/domain/auth/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormStatus } from "@/components/admin/form-status";

export function ProfileForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormField id="name" label="Nama Lengkap">
        <Input name="name" defaultValue={initialName} required />
      </FormField>
      <FormField id="email" label="Email">
        <Input
          name="email"
          type="email"
          defaultValue={initialEmail}
          autoComplete="email"
          required
        />
      </FormField>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FormStatus state={state} />
        <SubmitButton pending={pending} pendingLabel="Menyimpan...">
          Simpan Perubahan
        </SubmitButton>
      </div>
    </form>
  );
}

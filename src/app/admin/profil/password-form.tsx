"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/domain/auth/actions";
import { EMPTY_FORM_STATE } from "@/domain/action-state";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormStatus } from "@/components/admin/form-status";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    EMPTY_FORM_STATE
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormField id="currentPassword" label="Kata Sandi Saat Ini">
        <Input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <FormField
        id="newPassword"
        label="Kata Sandi Baru"
        hint="Minimal 10 karakter, mengandung huruf dan angka, bukan kata sandi umum."
      >
        <Input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FormStatus state={state} />
        <SubmitButton pending={pending} pendingLabel="Mengubah...">
          Ubah Kata Sandi
        </SubmitButton>
      </div>
    </form>
  );
}

"use client";

import type { AdminFormState } from "@/domain/action-state";
import { cn } from "@/lib/utils";

/**
 * Renders the error/success output of an admin server action. Errors are
 * announced via `role="alert"`, confirmations via `role="status"` (§34).
 */
export function FormStatus({ state }: { state: AdminFormState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p
      role={state.error ? "alert" : "status"}
      className={cn(
        "text-sm font-medium",
        state.error ? "text-destructive" : "text-emerald-600"
      )}
    >
      {state.error ?? state.success}
    </p>
  );
}

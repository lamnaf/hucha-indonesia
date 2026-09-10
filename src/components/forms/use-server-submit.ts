"use client";

import { useCallback, useState } from "react";
import type { PublicSubmitResult } from "@/shared/public-submit-result";

export type FormStatus = "idle" | "submitting" | "success";

interface ServerSubmitState {
  status: FormStatus;
  errors: Record<string, string>;
  error?: string;
}

/**
 * Drives a public form submission against a real server action (Phase 5:
 * replaces the mock-submit path). Shows a pending state while the action
 * runs and exposes per-field validation errors or a blocking error.
 */
export function useServerSubmit(
  action: (formData: FormData) => Promise<PublicSubmitResult>
) {
  const [state, setState] = useState<ServerSubmitState>({
    status: "idle",
    errors: {},
  });

  const handleSubmit = useCallback(
    async (formData: FormData): Promise<boolean> => {
      setState({ status: "submitting", errors: {}, error: undefined });
      const result = await action(formData);
      if (!result.ok) {
        setState({
          status: "idle",
          errors: result.errors ?? {},
          error: result.error,
        });
        return false;
      }
      setState({ status: "success", errors: {} });
      return true;
    },
    [action]
  );

  const reset = useCallback(() => {
    setState({ status: "idle", errors: {}, error: undefined });
  }, []);

  return {
    status: state.status,
    errors: state.errors,
    error: state.error,
    handleSubmit,
    reset,
  };
}

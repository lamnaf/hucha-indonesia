/**
 * Shared return shape for admin server actions used with `useActionState`.
 * Every admin form renders `error` (blocking) and `success` (confirmation)
 * states from this shape.
 */
export interface AdminFormState {
  error?: string;
  success?: string;
}

export const EMPTY_FORM_STATE: AdminFormState = {};

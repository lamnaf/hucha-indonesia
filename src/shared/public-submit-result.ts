/**
 * Return shape for public (unauthenticated) form submissions sent back to
 * client components via the `use-server-submit` hook.
 */
export interface PublicSubmitResult {
  ok: boolean;
  /** Per-field validation errors keyed by input name. */
  errors?: Record<string, string>;
  /** A single blocking/general error message. */
  error?: string;
}

export const PUBLIC_SUBMIT_SUCCESS: PublicSubmitResult = { ok: true };

/** Fatal transport/DB error message kept generic to avoid leaking internals. */
export const PUBLIC_SUBMIT_UNEXPECTED: PublicSubmitResult = {
  ok: false,
  error: "Terjadi kesalahan. Silakan coba lagi nanti.",
};

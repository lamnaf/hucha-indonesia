/**
 * Blocking/general form error (rate limit, job closed, transport failure).
 */
function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

export { FormError };

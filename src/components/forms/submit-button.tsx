import * as React from "react";

import { Button } from "@/components/ui/button";

export interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  pending?: boolean;
  pendingLabel?: string;
}

function SubmitButton({
  pending = false,
  pendingLabel = "Mengirim...",
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending ? (
        <>
          <span
            className="border-primary-foreground/40 border-t-primary-foreground size-3.5 animate-spin rounded-full border-2"
            aria-hidden="true"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { SubmitButton };

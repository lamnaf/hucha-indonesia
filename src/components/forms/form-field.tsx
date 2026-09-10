"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";

export interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

/**
 * Field wrapper that ties a label to its control and announces validation
 * errors via `aria-describedby` (WCAG 2.1 AA, blueprint §34).
 */
function FormField({ id, label, error, hint, children }: FormFieldProps) {
  const control = React.cloneElement(children, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  });

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {control}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };

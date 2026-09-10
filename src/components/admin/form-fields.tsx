"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

/**
 * Label + control + optional hint wrapper used by every admin form so
 * field markup stays consistent across modules.
 */
export function Field({ label, htmlFor, hint, required, children }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

export interface SubmitButtonProps {
  pending: boolean;
  children: React.ReactNode;
  pendingText?: string;
}

/** Submit button with pending/loading state shared by admin forms. */
export function SubmitButton({
  pending,
  children,
  pendingText = "Menyimpan...",
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      {pending ? pendingText : children}
    </Button>
  );
}

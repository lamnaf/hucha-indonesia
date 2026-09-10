"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const modalContentVariants = cva("", {
  variants: {
    size: {
      sm: "sm:max-w-sm",
      md: "sm:max-w-lg",
      lg: "sm:max-w-[min(42rem,calc(100%-2rem))]",
      xl: "sm:max-w-[min(56rem,calc(100%-2rem))]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Convenience modal built on the Dialog primitives — a controlled,
 * centered dialog with an optional header/footer. Use Dialog directly when
 * you need more granular control.
 */
function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  size,
  className,
}: ModalProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(modalContentVariants({ size }), className)}
      >
        {(title || description) && (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        )}
        {children}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </DialogRoot>
  );
}

export { Modal };

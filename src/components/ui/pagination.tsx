import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("list-none", className)}
      {...props}
    />
  );
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

/**
 * Real link for URL-driven pagination. Provide an `href` (or compose with
 * Next.js `Link`). For callback-driven pagination use the `*Button` variants
 * below, which are keyboard accessible without an href.
 */
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

type PaginationPageButtonProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"button">;

function PaginationPageButton({
  className,
  isActive,
  size = "icon",
  type = "button",
  ...props
}: PaginationPageButtonProps) {
  return (
    <button
      type={type}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-page-button"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  isDisabled = false,
  size = "default",
  type = "button",
  ...props
}: Omit<PaginationPageButtonProps, "isActive"> & {
  isDisabled?: boolean;
}) {
  return (
    <button
      type={type}
      aria-label="Halaman sebelumnya"
      data-slot="pagination-previous"
      disabled={isDisabled}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size,
        }),
        "gap-1 pl-2.5",
        className
      )}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span>Sebelumnya</span>
    </button>
  );
}

function PaginationNext({
  className,
  isDisabled = false,
  size = "default",
  type = "button",
  ...props
}: Omit<PaginationPageButtonProps, "isActive"> & {
  isDisabled?: boolean;
}) {
  return (
    <button
      type={type}
      aria-label="Halaman berikutnya"
      data-slot="pagination-next"
      disabled={isDisabled}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size,
        }),
        "gap-1 pr-2.5",
        className
      )}
      {...props}
    >
      <span>Berikutnya</span>
      <ChevronRightIcon className="size-4" />
    </button>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Halaman lainnya</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationPageButton,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

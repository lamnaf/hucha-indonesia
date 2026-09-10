import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationPageButton,
} from "@/components/ui/pagination";

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type PageItem = number | "ellipsis";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return range(1, totalPages);
  }

  if (current <= 4) {
    return [...range(1, 5), "ellipsis", totalPages];
  }

  if (current >= totalPages - 3) {
    return [1, "ellipsis", ...range(totalPages - 4, totalPages)];
  }

  return [
    1,
    "ellipsis",
    current - 1,
    current,
    current + 1,
    "ellipsis",
    totalPages,
  ];
}

/**
 * Reusable data-table pagination bar. Renders page links plus an optional
 * page-size selector. Pure presentational — pass values/state from the caller.
 */
function DataTablePagination({
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const items = getPaginationItems(page, totalPages);
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className={className}>
      <div className="text-muted-foreground mb-2 text-sm">
        Menampilkan {from}–{to} dari {totalRows} baris
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onPageSizeChange ? (
          <Pagination className="justify-start">
            <PaginationContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <PaginationItem key={option}>
                  <PaginationPageButton
                    size="sm"
                    isActive={pageSize === option}
                    onClick={() => onPageSizeChange(option)}
                  >
                    {option}
                  </PaginationPageButton>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        ) : (
          <div />
        )}
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                size="sm"
                isDisabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
              />
            </PaginationItem>
            {items.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationPageButton
                    size="sm"
                    isActive={item === page}
                    onClick={() => onPageChange?.(item)}
                  >
                    {item}
                  </PaginationPageButton>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                size="sm"
                isDisabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export { DataTablePagination };

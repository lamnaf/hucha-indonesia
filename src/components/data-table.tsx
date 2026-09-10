"use client";

import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyOf: (row: T) => string | number;
  loading?: boolean;
  skeletonRowCount?: number;
  empty?: React.ReactNode;
  footer?: React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  className?: string;
}

function DataTableSkeleton({
  columns,
  rowCount,
}: {
  columns: DataTableColumn<unknown>[];
  rowCount: number;
}) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`}>
          {columns.map((column) => (
            <TableCell key={column.id} className={column.className}>
              <div className="bg-muted animate-pulse h-4 w-full rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

/**
 * Reusable, presentation-only data table. Renders a header, body, optional
 * loading skeleton, empty state, footer, and bottom pagination. No sorting,
 * filtering, or state is owned here — pass data/state from the caller.
 */
function DataTable<T>({
  columns,
  rows,
  keyOf,
  loading = false,
  skeletonRowCount = 5,
  empty,
  footer,
  pagination,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {loading ? (
          <DataTableSkeleton
            columns={columns as DataTableColumn<unknown>[]}
            rowCount={skeletonRowCount}
          />
        ) : rows.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {empty ?? "Tidak ada data."}
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {rows.map((row) => (
              <TableRow key={keyOf(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
        {footer}
      </Table>
      {pagination ? (
        <DataTablePagination {...pagination} className="mt-4" />
      ) : null}
    </div>
  );
}

export { DataTable };

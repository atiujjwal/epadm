"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface BulkAction<T> {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  errorCorrelationId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  onRowClick?: (row: T) => void;
  totalCount?: number;
  pageSize?: number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  isLoading = false,
  error = null,
  errorCorrelationId,
  emptyTitle = "No records found",
  emptyDescription = "",
  emptyAction,
  hasActiveFilters = false,
  onClearFilters,
  selectable = false,
  bulkActions = [],
  onRowClick,
  totalCount,
  pageSize = 25,
  className,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const totalPages = totalCount === undefined
    ? undefined
    : Math.ceil(totalCount / pageSize);

  const toggleRow = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === data.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(getRowId)));
  };

  const selectedRows = data.filter((row) => selectedIds.has(getRowId(row)));

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger/5 px-6 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          {errorCorrelationId ? (
            <p className="mt-2 font-mono text-xs text-muted-foreground/60">
              ID: {errorCorrelationId}
            </p>
          ) : null}
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn("rounded-lg border", className)}
        aria-label="Loading data"
        aria-busy="true"
      >
        <Table>
          <TableHeader>
            <TableRow>
              {selectable ? <TableHead>{null}</TableHead> : null}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {selectable ? (
                  <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                ) : null}
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    <Skeleton
                      className={cn(
                        "h-4",
                        rowIndex % 3 === 0
                          ? "w-3/4"
                          : rowIndex % 3 === 1
                            ? "w-1/2"
                            : "w-2/3",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0 && !hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">{emptyTitle}</p>
          {emptyDescription ? (
            <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
          ) : null}
        </div>
        {emptyAction ? (
          <Button variant="secondary" size="sm" onClick={emptyAction.onClick}>
            {emptyAction.label}
          </Button>
        ) : null}
      </div>
    );
  }

  if (data.length === 0 && hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <Search className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">No results for your current filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or clearing the active filters.
          </p>
        </div>
        {onClearFilters ? (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all filters
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selectable && selectedIds.size > 0 && bulkActions.length > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "secondary"}
                size="sm"
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className={cn("rounded-lg border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={data.length > 0 && selectedIds.size === data.length}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const id = getRowId(row);
              return (
                <TableRow
                  key={id}
                  data-selected={selectedIds.has(id) || undefined}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    selectedIds.has(id) && "bg-primary/5",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable ? (
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(id)}
                        onCheckedChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages && totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{totalCount === undefined ? "" : `${totalCount.toLocaleString()} total records`}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

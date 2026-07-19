"use client";

import {
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  HTMLAttributes,
  forwardRef,
  createContext,
  useContext,
} from "react";
import { cn } from "@/lib/cn";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  variant?: "default" | "compact" | "spacious";
  striped?: boolean;
  hoverable?: boolean;
  children: React.ReactNode;
}

const TableContext = createContext<{
  variant: "default" | "compact" | "spacious";
  striped: boolean;
  hoverable: boolean;
}>({
  variant: "default",
  striped: false,
  hoverable: false,
});

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  const {
    variant = "default",
    striped = false,
    hoverable = false,
    className = "",
    children,
    ...rest
  } = props;

  return (
    <TableContext.Provider value={{ variant, striped, hoverable }}>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table
          ref={ref}
          className={cn("w-full border-collapse text-left text-sm text-slate-600", className)}
          {...rest}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
});

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <thead
      ref={ref}
      className={cn("border-b border-slate-200 bg-slate-50/75 font-semibold text-slate-900 backdrop-blur-xs sticky top-0", className)}
      {...rest}
    >
      {children}
    </thead>
  );
});

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <tbody
      ref={ref}
      className={cn("divide-y divide-slate-200/60 bg-white", className)}
      {...rest}
    >
      {children}
    </tbody>
  );
});

export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(function TableFooter(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <tfoot
      ref={ref}
      className={cn("border-t border-slate-200 bg-slate-50/50 font-medium text-slate-900", className)}
      {...rest}
    >
      {children}
    </tfoot>
  );
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const { className = "", children, ...rest } = props;
  const { striped, hoverable } = useContext(TableContext);

  return (
    <tr
      ref={ref}
      className={cn(
        "transition-colors duration-150",
        striped && "even:bg-slate-50/40",
        hoverable && "hover:bg-slate-50/75",
        className
      )}
      {...rest}
    >
      {children}
    </tr>
  );
});

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | "none";
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(props, ref) {
  const {
    className = "",
    children,
    sortable = false,
    sortDirection = "none",
    ...rest
  } = props;
  const { variant } = useContext(TableContext);

  const paddingClasses = {
    compact: "px-3 py-2 text-xs",
    default: "px-4 py-3.5 text-xs font-semibold uppercase tracking-wider",
    spacious: "px-6 py-4 text-sm font-semibold uppercase tracking-wider",
  }[variant];

  return (
    <th
      ref={ref}
      className={cn(
        "font-semibold text-slate-700 select-none align-middle",
        paddingClasses,
        sortable && "cursor-pointer hover:text-slate-900 transition-colors duration-150 group",
        className
      )}
      {...rest}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        {sortable && (
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors duration-150" aria-hidden="true">
            {sortDirection === "asc" && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M5.5 12.5L10 7.5L14.5 12.5" /></svg>
            )}
            {sortDirection === "desc" && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M5.5 7.5L10 12.5L14.5 7.5" /></svg>
            )}
            {sortDirection === "none" && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100">
                <path d="M5.5 12.5L10 7.5L14.5 12.5" />
                <path d="M5.5 7.5L10 12.5L14.5 7.5" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  variant?: "default" | "emphasized";
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const {
    className = "",
    children,
    align = "left",
    variant = "default",
    ...rest
  } = props;
  const { variant: tableVariant } = useContext(TableContext);

  const paddingClasses = {
    compact: "px-3 py-2 text-xs",
    default: "px-4 py-3.5 text-sm",
    spacious: "px-6 py-5 text-base",
  }[tableVariant];

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <td
      ref={ref}
      className={cn(
        "align-middle",
        paddingClasses,
        alignClasses,
        variant === "emphasized" && "font-semibold text-slate-900",
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
});

export const TableStyles = () => null;
export default Table;
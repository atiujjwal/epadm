import {
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  HTMLAttributes,
  forwardRef,
} from "react";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  variant?: "default" | "compact" | "spacious";
  striped?: boolean;
  hoverable?: boolean;
  children: React.ReactNode;
}

/**
 * EPADM Table Component
 *
 * Unified table with consistent styling, optional striping, and hover states.
 *
 * @example
 * <Table hoverable>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  const {
    variant = "default",
    striped = false,
    hoverable = false,
    className = "",
    children,
    ...rest
  } = props;

  const baseClasses = "table";
  const variantClasses = {
    default: "table--default",
    compact: "table--compact",
    spacious: "table--spacious",
  }[variant];

  const modifierClasses = [
    striped && "table--striped",
    hoverable && "table--hoverable",
  ]
    .filter(Boolean)
    .join(" ");

  const combinedClasses = [baseClasses, variantClasses, modifierClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="table__wrapper">
      <table ref={ref} className={combinedClasses} {...rest}>
        {children}
      </table>
    </div>
  );
});

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <thead ref={ref} className={`table__header ${className}`} {...rest}>
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
    <tbody ref={ref} className={`table__body ${className}`} {...rest}>
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
    <tfoot ref={ref} className={`table__footer ${className}`} {...rest}>
      {children}
    </tfoot>
  );
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const { className = "", children, ...rest } = props;

  return (
    <tr ref={ref} className={`table__row ${className}`} {...rest}>
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

  const combinedClasses = [
    "table__head",
    sortable && "table__head--sortable",
    sortDirection !== "none" && `table__head--sorted-${sortDirection}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <th ref={ref} className={combinedClasses} {...rest}>
      {children}
      {sortable && (
        <span className="table__sort-icon" aria-hidden="true">
          {sortDirection === "asc" && (
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 12.5L10 7.5L14.5 12.5" /></svg>
          )}
          {sortDirection === "desc" && (
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5L10 12.5L14.5 7.5" /></svg>
          )}
          {sortDirection === "none" && (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 12.5L10 7.5L14.5 12.5" />
              <path d="M5.5 7.5L10 12.5L14.5 7.5" />
            </svg>
          )}
        </span>
      )}
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

  const combinedClasses = [
    "table__cell",
    `table__cell--${align}`,
    variant === "emphasized" && "table__cell--emphasized",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <td ref={ref} className={combinedClasses} {...rest}>
      {children}
    </td>
  );
});

// Styles are now consolidated into global CSS
const TableStyles = () => null;

export { TableStyles };
export default Table;
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
      <TableStyles />
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

const TableStyles = () => (
  <style>{`
    .table__wrapper {
      width: 100%;
      overflow-x: auto;
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-default);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .table--default .table__cell,
    .table--default .table__head {
      padding: var(--space-4) var(--space-5);
    }

    .table--compact .table__cell,
    .table--compact .table__head {
      padding: var(--space-2-5) var(--space-3);
      font-size: var(--text-xs);
    }

    .table--spacious .table__cell,
    .table--spacious .table__head {
      padding: var(--space-5) var(--space-6);
    }

    .table__header {
      background: var(--bg-surface-2);
      border-bottom: 1px solid var(--border-default);
    }

    .table__head {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      white-space: nowrap;
    }

    .table__head--sortable {
      cursor: pointer;
      user-select: none;
    }

    .table__head--sortable:hover {
      color: var(--text-primary);
      background: var(--bg-surface-2);
    }

    .table__sort-icon {
      display: inline-flex;
      align-items: center;
      margin-left: var(--space-1);
      opacity: 0.5;
    }

    .table__head--sortable:hover .table__sort-icon {
      opacity: 1;
    }

    .table__sort-icon svg {
      width: 1rem;
      height: 1rem;
    }

    .table__body {
      background: var(--bg-surface);
    }

    .table__row {
      border-bottom: 1px solid var(--border-subtle);
      transition: background-color var(--duration-fast) var(--ease-default);
    }

    .table__row:last-child {
      border-bottom: none;
    }

    .table--striped .table__row:nth-child(even) {
      background: var(--bg-surface-2);
    }

    .table--hoverable .table__row:hover {
      background: var(--accent-subtle);
    }

    .table--striped.table--hoverable .table__row:hover {
      background: var(--color-indigo-100);
    }

    .table__cell {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      vertical-align: middle;
    }

    .table__cell--emphasized {
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }

    .table__cell--left {
      text-align: left;
    }

    .table__cell--center {
      text-align: center;
    }

    .table__cell--right {
      text-align: right;
    }

    .table__footer {
      background: var(--bg-surface-2);
      border-top: 1px solid var(--border-default);
      font-weight: var(--weight-semibold);
    }
  `}</style>
);

export { TableStyles };
export default Table;
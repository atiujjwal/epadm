import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/app-shell";

type Column<T> = { label: string; value: (row: T) => ReactNode };

export function OperationsPage<T>({
  title,
  subtitle,
  actions,
  columns,
  rows,
  empty,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  columns: Column<T>[];
  rows: T[];
  empty: string;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      <div className="p-6">
        <div className="overflow-hidden rounded-md border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{columns.map((column) => <th key={column.label} className="px-4 py-3 font-medium">{column.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">{empty}</td></tr>
              ) : rows.map((row, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  {columns.map((column) => <td key={column.label} className="px-4 py-3 align-top">{column.value(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const tone = status === "published" || status === "active" ? "default" : "outline";
  return <Badge variant={tone}>{status ?? "draft"}</Badge>;
}

export function RouteButton({ href, children }: { href: string; children: ReactNode }) {
  return <Button asChild size="sm" variant="secondary"><Link href={href}>{children}</Link></Button>;
}

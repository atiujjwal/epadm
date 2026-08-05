import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/phase11/shared";

type Column<T> = { label: string; value: (row: T) => React.ReactNode };

export function SimpleTable<T extends object>({ rows, columns, empty = "No records yet." }: { rows: T[]; columns: Column<T>[]; empty?: string }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed bg-surface p-8 text-center text-sm text-muted-foreground">{empty}</div>;
  return (
    <div className="overflow-hidden rounded-lg border bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>{columns.map((column) => <th key={column.label} className="px-4 py-3">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={("id" in row ? String(row.id) : String(index))}>
              {columns.map((column) => <td key={column.label} className="px-4 py-3 align-top">{column.value(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortalShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="space-y-6 p-6"><PageHeader title={title} description={description} />{children}</div>;
}

export function StatGrid({ stats }: { stats: Array<{ label: string; value: React.ReactNode; tone?: "default" | "good" | "warn" }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-surface p-4">
          <p className="text-xs uppercase text-muted-foreground">{stat.label}</p>
          <div className="mt-2 text-2xl font-semibold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export function Status({ value }: { value: string | boolean | null | undefined }) {
  return <Badge variant="outline" className="capitalize">{String(value ?? "-").replace(/_/g, " ")}</Badge>;
}

export function EmptyPortal({ message }: { message: string }) {
  return <div className="rounded-lg border border-dashed bg-surface p-8 text-center text-sm text-muted-foreground">{message}</div>;
}

export function ChildSwitcher({ students, selectedId }: { students: Array<{ studentId: string; firstName: string; lastName: string | null; className: string | null; sectionName: string | null }>; selectedId?: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {students.map((student) => (
        <Link key={student.studentId} href={`/parent?studentId=${student.studentId}`} className={`rounded-md border px-3 py-2 text-sm ${selectedId === student.studentId ? "bg-primary text-primary-foreground" : "bg-surface"}`}>
          {student.firstName} {student.lastName ?? ""} <span className="text-xs opacity-70">{student.className ?? ""}{student.sectionName ? `-${student.sectionName}` : ""}</span>
        </Link>
      ))}
    </div>
  );
}

export { formatINR };

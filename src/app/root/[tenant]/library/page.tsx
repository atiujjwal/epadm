import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function LibraryPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  const activeIssues = model.issues.filter((issue) => !issue.returnedAt);
  const rows = [
    { metric: "Titles", value: String(model.titles.length), detail: `${model.copies.length} accessioned copies`, status: "live" },
    { metric: "Available copies", value: String(model.copies.filter((copy) => copy.status === "available").length), detail: "Ready to issue", status: "live" },
    { metric: "Active issues", value: String(activeIssues.length), detail: "Currently borrowed", status: "live" },
    { metric: "Open fines", value: formatCurrency(model.fines.filter((fine) => fine.status === "open").reduce((sum, fine) => sum + fine.amountPaise - fine.paidPaise, 0)), detail: "Library fine balance", status: "open" },
  ];
  return <OperationsPage title="Library" subtitle="Catalog, copies, members, circulation, fines, and acquisitions" actions={<div className="flex gap-2"><RouteButton href="/library/catalog">Catalog</RouteButton><RouteButton href="/library/circulation">Circulation</RouteButton><RouteButton href="/library/overdue">Overdue</RouteButton></div>} rows={rows} empty="No library data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

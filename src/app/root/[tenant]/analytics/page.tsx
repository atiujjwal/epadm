import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { getAnalyticsDashboard } from "@/lib/phase12/analytics";
import { PortalShell, SimpleTable, StatGrid, Status, formatINR } from "../phase11-view";

function numberFrom(data: Record<string, unknown>, key: string) {
  return Number(data[key] ?? 0);
}

export default async function AnalyticsPage() {
  const ctx = await requirePermission("analytics.read");
  const model = await getAnalyticsDashboard(ctx.tenantId);
  const admin = model.admin as Record<string, unknown>;
  const finance = model.finance as Record<string, unknown>;

  return (
    <PortalShell title="Analytics & Reports" description="Cached intelligence snapshots, role dashboards, curated exports, and data-quality checks.">
      <div className="flex flex-wrap gap-2">
        {[
          ["/analytics/academic", "Academic"],
          ["/analytics/finance", "Finance"],
          ["/analytics/hr", "HR"],
          ["/analytics/data-quality", "Data quality"],
          ["/analytics/reports", "Reports"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-md border bg-surface px-3 py-2 text-sm hover:bg-muted">{label}</Link>
        ))}
      </div>

      <StatGrid stats={[
        { label: "Active students", value: numberFrom(admin, "activeStudents") },
        { label: "Active staff", value: numberFrom(admin, "activeStaff") },
        { label: "Collected fees", value: formatINR(numberFrom(finance, "collectedPaise")) },
        { label: "AI drafts", value: numberFrom(admin, "aiDrafts") },
      ]} />

      <SimpleTable
        rows={model.recentReports}
        empty="No report runs yet."
        columns={[
          { label: "Report", value: (row) => row.reportLabel },
          { label: "Status", value: (row) => <Status value={row.status} /> },
          { label: "Rows", value: (row) => row.rowCount ?? "-" },
          { label: "Export", value: (row) => row.exportUrl ? <Link className="text-primary underline" href={row.exportUrl}>CSV</Link> : "-" },
        ]}
      />
    </PortalShell>
  );
}

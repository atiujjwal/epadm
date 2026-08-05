import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listReportCatalog, listReportRuns } from "@/lib/phase12/reports";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function ReportsPage() {
  const ctx = await requirePermission("analytics.read");
  const [reports, runs] = await Promise.all([Promise.resolve(listReportCatalog()), listReportRuns(ctx.tenantId)]);
  return (
    <PortalShell title="Report Catalog" description="Curated operational reports with CSV/PDF exports. No arbitrary SQL surface is exposed.">
      <SimpleTable rows={reports} columns={[
        { label: "Report", value: (row) => <Link className="font-medium text-primary underline" href={`/analytics/reports/${row.key}`}>{row.label}</Link> },
        { label: "Category", value: (row) => <Status value={row.category} /> },
        { label: "Permission", value: (row) => row.requiredPermission },
        { label: "Description", value: (row) => row.description },
      ]} />

      <SimpleTable rows={runs} empty="No report runs yet." columns={[
        { label: "Run", value: (row) => row.reportLabel },
        { label: "Status", value: (row) => <Status value={row.status} /> },
        { label: "Rows", value: (row) => row.rowCount ?? "-" },
        { label: "Exports", value: (row) => row.status === "complete" ? <span className="space-x-2"><Link className="text-primary underline" href={`/api/v1/analytics/reports/run/${row.id}/csv`}>CSV</Link><Link className="text-primary underline" href={`/api/v1/analytics/reports/run/${row.id}/pdf`}>PDF</Link></span> : "-" },
      ]} />
    </PortalShell>
  );
}

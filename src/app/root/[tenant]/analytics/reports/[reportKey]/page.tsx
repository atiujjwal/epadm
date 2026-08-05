import { requirePermission } from "@/lib/auth/guards";
import { getReportDefinition } from "@/lib/phase12/reports";
import { PortalShell, SimpleTable } from "../../../phase11-view";

export default async function ReportDetailPage(_props: { params: Promise<{ reportKey: string }> }) {
  const { reportKey } = await _props.params;
  const report = getReportDefinition(reportKey);
  await requirePermission("reports.run");
  if (report.requiredPermission !== "reports.run") await requirePermission(report.requiredPermission);

  return (
    <PortalShell title={report.label} description={report.description}>
      <div className="rounded-lg border bg-surface p-4 text-sm">
        <p className="font-medium">Run this report</p>
        <p className="mt-1 text-muted-foreground">
          POST <code>/api/v1/analytics/reports/run</code> with <code>{JSON.stringify({ reportKey: report.key, parameters: {} })}</code>.
          The completed run creates CSV and PDF exports under the run record.
        </p>
      </div>
      <SimpleTable rows={report.columns} columns={[
        { label: "Column key", value: (row) => row.key },
        { label: "Label", value: (row) => row.label },
      ]} />
    </PortalShell>
  );
}

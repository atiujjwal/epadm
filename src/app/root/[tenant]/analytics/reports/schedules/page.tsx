import { requirePermission } from "@/lib/auth/guards";
import { listReportSchedules } from "@/lib/phase12/reports";
import { PortalShell, SimpleTable, Status } from "../../../phase11-view";

export default async function ReportSchedulesPage() {
  const ctx = await requirePermission("reports.schedule.manage");
  const schedules = await listReportSchedules(ctx.tenantId);
  return (
    <PortalShell title="Scheduled Reports" description="Tenant-scoped report schedules. Delivery workers can pick up active rows by next run time.">
      <SimpleTable rows={schedules} empty="No scheduled reports yet." columns={[
        { label: "Report", value: (row) => row.reportLabel },
        { label: "Frequency", value: (row) => <Status value={row.frequency} /> },
        { label: "Run time", value: (row) => row.runTime },
        { label: "Recipients", value: (row) => row.recipients?.join(", ") || "-" },
        { label: "Active", value: (row) => <Status value={row.isActive} /> },
      ]} />
    </PortalShell>
  );
}

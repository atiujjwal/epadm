import { requirePermission } from "@/lib/auth/guards";
import { getRoleAnalytics } from "@/lib/phase12/analytics";
import { PortalShell, StatGrid, formatINR } from "../../phase11-view";

export default async function HrAnalyticsPage() {
  const ctx = await requirePermission("hr.analytics.read");
  const data = await getRoleAnalytics(ctx.tenantId, "hr") as Record<string, unknown>;
  return (
    <PortalShell title="HR Analytics" description="People, leave, and payroll indicators from Phase 8 workflows.">
      <StatGrid stats={[
        { label: "Active staff", value: Number(data.activeStaff ?? 0) },
        { label: "Pending leave", value: Number(data.pendingLeaves ?? 0) },
        { label: "Locked payroll runs", value: Number(data.lockedRuns ?? 0) },
        { label: "Payroll net", value: formatINR(Number(data.payrollNetPaise ?? 0)) },
      ]} />
    </PortalShell>
  );
}

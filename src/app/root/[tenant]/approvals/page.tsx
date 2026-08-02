import { requirePermission } from "@/lib/auth/guards";
import { getPendingApprovals } from "@/lib/phase8/hr";
import { OperationsPage, StatusBadge } from "../academics/phase4-view";

export default async function ApprovalsPage() {
  const ctx = await requirePermission("approvals.read");
  const approvals = await getPendingApprovals(ctx.tenantId, ctx.userId);
  return <OperationsPage title="Approvals" subtitle={`${approvals.count} pending actionable approvals`} rows={approvals.leave} empty="No approvals need your attention." columns={[
    { label: "Type", value: () => "Staff leave" },
    { label: "Staff", value: (row) => `${row.employeeCode} · ${row.staffName}` },
    { label: "Dates", value: (row) => `${row.fromDate} → ${row.toDate}` },
    { label: "Days", value: (row) => row.days },
    { label: "Level", value: (row) => row.approvalLevel },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

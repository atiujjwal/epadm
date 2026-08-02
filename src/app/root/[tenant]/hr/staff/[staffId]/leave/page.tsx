import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { OperationsPage, StatusBadge } from "../../../../academics/phase4-view";

export default async function StaffLeavePage({ params }: { params: Promise<{ staffId: string }> }) {
  const ctx = await requirePermission("hr.leave.read");
  const { staffId } = await params;
  const model = await listHrPhase8Model(ctx.tenantId);
  const rows = model.leaveRequests.filter((request) => request.staffId === staffId);
  return <OperationsPage title="Staff Leave" subtitle={`${rows.length} leave requests · ${model.leaveBalances.filter((balance) => balance.staffId === staffId).length} balance rows`} rows={rows} empty="No staff leave requests recorded." columns={[
    { label: "Type", value: (row) => model.leaveTypes.find((type) => type.id === row.leaveTypeId)?.code ?? "Leave" },
    { label: "Dates", value: (row) => `${row.fromDate} → ${row.toDate}` },
    { label: "Days", value: (row) => row.days },
    { label: "Reason", value: (row) => row.reason ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

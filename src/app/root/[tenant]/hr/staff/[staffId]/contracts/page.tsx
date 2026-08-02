import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase8/payroll";
import { listStaffContracts } from "@/lib/phase8/hr";
import { OperationsPage, StatusBadge } from "../../../../academics/phase4-view";

export default async function StaffContractsPage({ params }: { params: Promise<{ staffId: string }> }) {
  const ctx = await requirePermission("hr.contracts.read");
  const { staffId } = await params;
  const rows = await listStaffContracts(ctx.tenantId, staffId);
  return <OperationsPage title="Staff Contracts" subtitle={`${rows.length} contract records`} rows={rows} empty="No contracts recorded for this staff member." columns={[
    { label: "Title", value: (row) => row.title },
    { label: "Type", value: (row) => row.contractType },
    { label: "Dates", value: (row) => `${row.startDate} → ${row.endDate ?? "Current"}` },
    { label: "Gross", value: (row) => formatCurrency(row.grossSalaryPaise) },
    { label: "Basic", value: (row) => formatCurrency(row.basicSalaryPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

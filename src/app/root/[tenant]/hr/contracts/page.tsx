import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { formatCurrency } from "@/lib/phase8/payroll";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function HrContractsPage() {
  const ctx = await requirePermission("hr.contracts.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return <OperationsPage title="Contracts" subtitle={`${model.contracts.length} staff contracts`} rows={model.contracts} empty="No contracts recorded." columns={[
    { label: "Staff", value: (row) => `${row.employeeCode} · ${row.staffName}` },
    { label: "Title", value: (row) => row.title },
    { label: "Dates", value: (row) => `${row.startDate} → ${row.endDate ?? "Current"}` },
    { label: "Gross", value: (row) => formatCurrency(row.grossSalaryPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function PayrollComponentsPage() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return <OperationsPage title="Payroll Components" subtitle="Earnings, deductions, statutory deductions, and employer contributions" rows={model.components} empty="No payroll components configured." columns={[
    { label: "Code", value: (row) => row.code },
    { label: "Name", value: (row) => row.name },
    { label: "Type", value: (row) => row.componentType },
    { label: "Calc", value: (row) => row.calcType },
    { label: "Default", value: (row) => row.defaultValue ?? "—" },
    { label: "PF", value: (row) => row.isPfApplicable ? "Yes" : "No" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
  ]} />;
}

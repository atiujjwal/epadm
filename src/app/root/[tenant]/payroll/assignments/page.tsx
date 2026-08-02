import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function PayrollAssignmentsPage() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return <OperationsPage title="Salary Assignments" subtitle={`${model.assignments.length} active or historical component assignments`} rows={model.assignments} empty="No salary assignments configured." columns={[
    { label: "Staff", value: (row) => `${row.employeeCode} · ${row.staffName}` },
    { label: "Component", value: (row) => model.components.find((component) => component.id === row.componentId)?.code ?? row.componentId },
    { label: "Override", value: (row) => row.overrideValue ?? "Default" },
    { label: "From", value: (row) => String(row.effectiveFrom) },
    { label: "To", value: (row) => row.effectiveTo ? String(row.effectiveTo) : "Current" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
  ]} />;
}

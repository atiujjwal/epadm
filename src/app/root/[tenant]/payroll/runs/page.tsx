import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function PayrollRunsPage() {
  const ctx = await requirePermission("payroll.runs.read");
  const model = await listPayrollModel(ctx.tenantId);
  return <OperationsPage title="Payroll Runs" subtitle={`${model.runs.length} payroll cycles · ${model.entries.length} computed entries`} actions={<div className="flex gap-2"><RouteButton href="/payroll/assignments">Salary assignments</RouteButton><RouteButton href="/payroll/settings">Settings</RouteButton></div>} rows={model.runs} empty="No payroll runs yet. Create a run through the API or seed data." columns={[
    { label: "Run", value: (row) => row.runLabel },
    { label: "Staff", value: (row) => row.staffCount },
    { label: "Gross", value: (row) => formatCurrency(row.totalGrossPaise) },
    { label: "Deductions", value: (row) => formatCurrency(row.totalDeductionsPaise) },
    { label: "Net", value: (row) => formatCurrency(row.totalNetPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "Open", value: (row) => <RouteButton href={`/payroll/runs/${row.id}`}>Details</RouteButton> },
  ]} />;
}

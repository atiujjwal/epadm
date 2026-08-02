import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage, RouteButton } from "../../../../academics/phase4-view";

export default async function StaffPayrollPage({ params }: { params: Promise<{ staffId: string }> }) {
  const ctx = await requirePermission("payroll.read");
  const { staffId } = await params;
  const model = await listPayrollModel(ctx.tenantId);
  const rows = model.entries.filter((entry) => entry.staffId === staffId);
  const latest = rows[0];
  return <OperationsPage title="Staff Payroll" subtitle={latest ? `Latest net pay ${formatCurrency(latest.netPaise)}` : "No computed payroll entries yet"} actions={<RouteButton href={`/payroll/assignments`}>Configure Salary</RouteButton>} rows={rows} empty="No payslip history for this staff member." columns={[
    { label: "Run", value: (row) => model.runs.find((run) => run.id === row.runId)?.runLabel ?? row.runId },
    { label: "Gross", value: (row) => formatCurrency(row.grossPaise) },
    { label: "Deductions", value: (row) => formatCurrency(row.totalDeductionsPaise) },
    { label: "Net", value: (row) => formatCurrency(row.netPaise) },
    { label: "Payslip", value: (row) => model.payslips.find((slip) => slip.entryId === row.id)?.pdfUrl ?? "Not generated" },
  ]} />;
}

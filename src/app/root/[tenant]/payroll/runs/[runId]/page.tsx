import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage, RouteButton, StatusBadge } from "../../../academics/phase4-view";

export default async function PayrollRunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const ctx = await requirePermission("payroll.runs.read");
  const { runId } = await params;
  const model = await listPayrollModel(ctx.tenantId);
  const run = model.runs.find((item) => item.id === runId);
  if (!run) notFound();
  const rows = model.entries.filter((entry) => entry.runId === runId);
  return <OperationsPage title={run.runLabel} subtitle={`${rows.length} staff entries · ${formatCurrency(run.totalNetPaise)} net payable`} actions={<div className="flex gap-2"><RouteButton href="/payroll/statutory">Statutory</RouteButton><RouteButton href="/payroll/runs">Back</RouteButton></div>} rows={rows} empty="No payroll entries have been computed for this run." columns={[
    { label: "Employee", value: (row) => `${row.employeeCode} · ${row.staffName}` },
    { label: "Gross", value: (row) => formatCurrency(row.grossPaise) },
    { label: "Deductions", value: (row) => formatCurrency(row.totalDeductionsPaise) },
    { label: "Net", value: (row) => formatCurrency(row.netPaise) },
    { label: "Absent", value: (row) => row.daysAbsent },
    { label: "Run status", value: () => <StatusBadge status={run.status} /> },
  ]} />;
}

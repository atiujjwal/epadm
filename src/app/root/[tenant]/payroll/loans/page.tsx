import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function PayrollLoansPage() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return <OperationsPage title="Staff Loans & Advances" subtitle={`${model.loans.length} loans and salary advances`} rows={model.loans} empty="No staff loans recorded." columns={[
    { label: "Staff", value: (row) => `${row.employeeCode} · ${row.staffName}` },
    { label: "Type", value: (row) => row.loanType },
    { label: "Principal", value: (row) => formatCurrency(row.principalPaise) },
    { label: "EMI", value: (row) => formatCurrency(row.emiPaise) },
    { label: "Outstanding", value: (row) => formatCurrency(row.outstandingPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

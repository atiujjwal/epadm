import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, getOverdueInvoices } from "@/lib/phase7/finance";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function OverduePage() {
  const ctx = await requirePermission("finance.fees.read");
  const rows = await getOverdueInvoices(ctx.tenantId);
  return <OperationsPage title="Overdue Fees" subtitle={`${rows.length} open overdue invoices`} rows={rows} empty="No overdue invoices. Nice and tidy." columns={[
    { label: "Student", value: (row) => `${row.studentName} · ${row.admissionNumber}` },
    { label: "Invoice", value: (row) => row.invoiceNumber ?? row.title },
    { label: "Balance", value: (row) => formatCurrency(row.balancePaise ?? 0) },
    { label: "Days overdue", value: (row) => String(row.daysOverdue) },
    { label: "Late fee", value: (row) => formatCurrency(row.lateFeePaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

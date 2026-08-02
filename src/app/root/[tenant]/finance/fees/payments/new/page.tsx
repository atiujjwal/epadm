import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage, StatusBadge } from "../../../../academics/phase4-view";

export default async function RecordPaymentPage() {
  const ctx = await requirePermission("finance.fees.payments.record");
  const model = await listFinanceModel(ctx.tenantId);
  const rows = model.invoices.filter((invoice) => !invoice.voidedAt && (invoice.balancePaise ?? 0) > 0);
  return <OperationsPage title="Record Payment" subtitle="Use POST /api/v1/finance/fees/payments to record the selected invoice payment" rows={rows} empty="No open invoices available for payment." columns={[
    { label: "Invoice", value: (row) => row.invoiceNumber ?? row.title },
    { label: "Student", value: (row) => row.studentName },
    { label: "Balance", value: (row) => formatCurrency(row.balancePaise ?? 0) },
    { label: "Due", value: (row) => String(row.dueDate) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

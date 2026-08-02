import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage, RouteButton, StatusBadge } from "../../../academics/phase4-view";

export default async function InvoicesPage() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return <OperationsPage title="Invoices" subtitle={`${model.invoices.length} invoices · generated idempotently`} actions={<RouteButton href="/finance/fees/payments/new">Record payment</RouteButton>} rows={model.invoices} empty="No invoices generated yet." columns={[
    { label: "Invoice", value: (row) => row.invoiceNumber ?? row.id.slice(0, 8).toUpperCase() },
    { label: "Student", value: (row) => row.studentName },
    { label: "Period", value: (row) => row.periodLabel ?? row.title },
    { label: "Balance", value: (row) => formatCurrency(row.balancePaise ?? 0) },
    { label: "Due", value: (row) => String(row.dueDate) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "Open", value: (row) => <RouteButton href={`/finance/fees/invoices/${row.id}`}>View</RouteButton> },
  ]} />;
}

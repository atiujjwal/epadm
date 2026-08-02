import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function FeesDashboardPage() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  const invoices = model.invoices.filter((invoice) => !invoice.voidedAt);
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + (invoice.totalPaise ?? invoice.amount * 100), 0);
  const totalCollected = invoices.reduce((sum, invoice) => sum + invoice.paidPaise, 0);
  const outstanding = invoices.reduce((sum, invoice) => sum + (invoice.balancePaise ?? 0), 0);
  const overdue = invoices.filter((invoice) => invoice.status === "overdue" || (String(invoice.dueDate) < new Date().toISOString().slice(0, 10) && (invoice.balancePaise ?? 0) > 0)).reduce((sum, invoice) => sum + (invoice.balancePaise ?? 0), 0);
  const rows = [
    { metric: "Total invoiced", value: formatCurrency(totalInvoiced), detail: `${invoices.length} non-void invoices`, status: "live" },
    { metric: "Total collected", value: formatCurrency(totalCollected), detail: `${model.payments.length} payment records`, status: "live" },
    { metric: "Outstanding", value: formatCurrency(outstanding), detail: "Balance across open invoices", status: outstanding > 0 ? "open" : "clear" },
    { metric: "Overdue", value: formatCurrency(overdue), detail: "Due date has passed", status: overdue > 0 ? "overdue" : "clear" },
  ];
  return <OperationsPage title="Fees & Billing" subtitle={`${model.structures.length} structures, ${model.plans.length} plans, ${model.invoices.length} invoices`} actions={<div className="flex gap-2"><RouteButton href="/finance/fees/invoices">Invoices</RouteButton><RouteButton href="/finance/fees/payments/new">Record payment</RouteButton></div>} rows={rows} empty="No fee data available." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

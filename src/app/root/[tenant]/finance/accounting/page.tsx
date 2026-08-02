import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, getAccountingSummary } from "@/lib/phase7/finance";
import { OperationsPage, RouteButton } from "../../academics/phase4-view";

export default async function AccountingPage() {
  const ctx = await requirePermission("finance.accounting.read");
  const summary = await getAccountingSummary(ctx.tenantId, { type: "all" });
  const rows = [
    { metric: "Income", value: formatCurrency(summary.incomePaise), detail: "Posted fee collections and income transactions" },
    { metric: "Expenses", value: formatCurrency(summary.expensePaise), detail: "Manual expense transactions" },
    { metric: "Net surplus / deficit", value: formatCurrency(summary.netPaise), detail: "Income minus expenses" },
  ];
  return <OperationsPage title="Accounting" subtitle="Simplified income and expense ledger" actions={<div className="flex gap-2"><RouteButton href="/finance/accounting/accounts">Accounts</RouteButton><RouteButton href="/finance/accounting/reports">Reports</RouteButton></div>} rows={rows} empty="No accounting summary available." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
  ]} />;
}

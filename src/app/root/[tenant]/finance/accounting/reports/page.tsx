import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, getAccountingSummary } from "@/lib/phase7/finance";
import { OperationsPage } from "../../../academics/phase4-view";

export default async function AccountingReportsPage() {
  const ctx = await requirePermission("finance.accounting.read");
  const summary = await getAccountingSummary(ctx.tenantId, { type: "all" });
  return <OperationsPage title="Financial Reports" subtitle={`Net ${formatCurrency(summary.netPaise)}`} rows={summary.accounts} empty="No ledger rows available." columns={[
    { label: "Account", value: (row) => `${row.accountCode} · ${row.accountName}` },
    { label: "Type", value: (row) => row.type },
    { label: "Total", value: (row) => formatCurrency(Number(row.totalPaise)) },
  ]} />;
}

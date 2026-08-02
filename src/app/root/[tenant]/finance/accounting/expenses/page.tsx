import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { financialTransactions } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, desc, eq } from "drizzle-orm";
import { OperationsPage } from "../../../academics/phase4-view";

export default async function ExpensesPage() {
  const ctx = await requirePermission("finance.accounting.read");
  await listFinanceModel(ctx.tenantId);
  const rows = await withTenant(ctx.tenantId, (tx) => tx.select().from(financialTransactions).where(and(eq(financialTransactions.tenantId, ctx.tenantId), eq(financialTransactions.transactionType, "expense"))).orderBy(desc(financialTransactions.transactionDate)));
  return <OperationsPage title="Expenses" subtitle="Manual expenses posted to accounting" rows={rows} empty="No expenses recorded." columns={[
    { label: "Date", value: (row) => String(row.transactionDate ?? row.date) },
    { label: "Description", value: (row) => row.description },
    { label: "Amount", value: (row) => formatCurrency(row.amountPaise ?? row.amount * 100) },
    { label: "Reference", value: (row) => row.reference ?? "—" },
  ]} />;
}

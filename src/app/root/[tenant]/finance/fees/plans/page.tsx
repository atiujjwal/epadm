import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function FeePlansPage() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  const rows = model.plans.map((plan) => ({ ...plan, installmentTotal: model.installments.filter((item) => item.planId === plan.id).reduce((sum, item) => sum + item.amountPaise, 0), installmentCount: model.installments.filter((item) => item.planId === plan.id).length }));
  return <OperationsPage title="Payment Plans" subtitle={`${rows.length} plans · installments validated by API`} rows={rows} empty="No payment plans configured." columns={[
    { label: "Plan", value: (row) => row.name },
    { label: "Type", value: (row) => row.planType },
    { label: "Installments", value: (row) => String(row.installmentCount) },
    { label: "Total", value: (row) => formatCurrency(row.installmentTotal) },
    { label: "Default", value: (row) => <StatusBadge status={row.isDefault ? "default" : "custom"} /> },
  ]} />;
}

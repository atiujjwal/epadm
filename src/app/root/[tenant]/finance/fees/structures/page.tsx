import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage, RouteButton, StatusBadge } from "../../../academics/phase4-view";

export default async function FeeStructuresPage() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return <OperationsPage title="Fee Structures" subtitle={`${model.categories.length} categories · ${model.structures.length} structures`} actions={<RouteButton href="/finance/fees/plans">Payment plans</RouteButton>} rows={model.structures} empty="No fee structures configured." columns={[
    { label: "Name", value: (row) => row.name },
    { label: "Class", value: (row) => row.className },
    { label: "Year", value: (row) => row.academicYear },
    { label: "Total", value: (row) => formatCurrency(row.totalAmountPaise || row.amountPaise || row.amount * 100) },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
  ]} />;
}

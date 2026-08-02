import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, getCollectionsSummary } from "@/lib/phase7/finance";
import { OperationsPage } from "../../../academics/phase4-view";

export default async function CollectionsPage() {
  const ctx = await requirePermission("finance.fees.read");
  const summary = await getCollectionsSummary(ctx.tenantId, {});
  return <OperationsPage title="Collections" subtitle={`${formatCurrency(summary.totalPaise)} collected today`} rows={summary.rows} empty="No collections found for today." columns={[
    { label: "Date", value: (row) => String(row.paymentDate) },
    { label: "Student", value: (row) => row.studentName },
    { label: "Invoice", value: (row) => row.invoiceNumber ?? "—" },
    { label: "Amount", value: (row) => formatCurrency(row.amountPaise) },
    { label: "Method", value: (row) => row.paymentMethod },
    { label: "Receipt", value: (row) => row.receiptNumber ?? "—" },
    { label: "Collector", value: (row) => row.collector ?? "—" },
  ]} />;
}

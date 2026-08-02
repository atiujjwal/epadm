import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LibraryFinesPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return <OperationsPage title="Library Fines" subtitle={`${model.fines.length} fine records`} rows={model.fines} empty="No library fines." columns={[
    { label: "Reason", value: (row) => row.reason },
    { label: "Amount", value: (row) => formatCurrency(row.amountPaise) },
    { label: "Paid", value: (row) => formatCurrency(row.paidPaise) },
    { label: "Balance", value: (row) => formatCurrency(row.amountPaise - row.paidPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

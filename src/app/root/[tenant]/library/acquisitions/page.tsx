import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LibraryAcquisitionsPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return <OperationsPage title="Library Acquisitions" subtitle={`${model.acquisitions.length} orders`} rows={model.acquisitions} empty="No acquisition orders yet." columns={[
    { label: "Vendor", value: (row) => row.vendorName ?? "-" },
    { label: "Order", value: (row) => row.orderNumber ?? "-" },
    { label: "Date", value: (row) => row.orderDate ? String(row.orderDate) : "-" },
    { label: "Total", value: (row) => formatCurrency(row.totalPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

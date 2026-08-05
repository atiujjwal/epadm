import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listFacilitiesModel } from "@/lib/phase10/facilities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function WorkOrdersPage() {
  const ctx = await requirePermission("facilities.work-orders.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  return <OperationsPage title="Work Orders" subtitle="Maintenance requests and completion tracking" rows={model.workOrders} empty="No work orders yet." columns={[
    { label: "WO", value: (row) => row.workOrderNumber },
    { label: "Title", value: (row) => row.title },
    { label: "Priority", value: (row) => <StatusBadge status={row.priority} /> },
    { label: "Location", value: (row) => row.location ?? "—" },
    { label: "Assigned", value: (row) => row.assignedToName ?? "—" },
    { label: "Cost", value: (row) => formatCurrency(row.costPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

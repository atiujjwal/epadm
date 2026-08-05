import { requirePermission } from "@/lib/auth/guards";
import { listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function InventoryRequisitionsPage() {
  const ctx = await requirePermission("inventory.requisitions.read");
  const model = await listInventoryModel(ctx.tenantId);
  return <OperationsPage title="Purchase Requisitions" subtitle="Request and approval queue" rows={model.requisitions} empty="No requisitions yet." columns={[
    { label: "Number", value: (row) => row.requisitionNumber },
    { label: "Priority", value: (row) => row.priority },
    { label: "Required by", value: (row) => row.requiredByDate ?? "—" },
    { label: "Notes", value: (row) => row.notes ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

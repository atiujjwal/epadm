import { requirePermission } from "@/lib/auth/guards";
import { listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage } from "../../academics/phase4-view";

export default async function InventoryStockPage() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  const itemName = new Map(model.items.map((item) => [item.id, `${item.name} (${item.unit})`]));
  return <OperationsPage title="Stock Levels" subtitle="Current quantity per item and location" rows={model.stock} empty="No stock balances yet." columns={[
    { label: "Item", value: (row) => itemName.get(row.itemId) ?? row.itemId },
    { label: "Location", value: (row) => row.location },
    { label: "Quantity", value: (row) => row.quantity },
    { label: "Last updated", value: (row) => row.lastUpdated.toLocaleString() },
  ]} />;
}

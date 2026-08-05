import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function InventoryItemsPage() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  const categoryName = new Map(model.categories.map((category) => [category.id, category.name]));
  return <OperationsPage title="Inventory Items" subtitle="Catalog with aggregated stock status" rows={model.items} empty="No items yet." columns={[
    { label: "Code", value: (row) => row.itemCode ?? "—" },
    { label: "Name", value: (row) => row.name },
    { label: "Category", value: (row) => categoryName.get(row.categoryId) ?? "—" },
    { label: "Unit", value: (row) => row.unit },
    { label: "Stock", value: (row) => `${row.totalStock} ${row.unit}` },
    { label: "Reorder", value: (row) => row.reorderLevel },
    { label: "Unit cost", value: (row) => formatCurrency(row.unitCostPaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.stockStatus} /> },
  ]} />;
}

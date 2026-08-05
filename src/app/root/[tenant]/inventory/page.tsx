import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function InventoryPage() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  const rows = [
    { metric: "Items", value: String(model.items.length), detail: `${model.items.filter((row) => row.stockStatus === "low").length} low stock`, status: "live" },
    { metric: "Stock locations", value: String(model.stock.length), detail: "Item-location balances", status: "live" },
    { metric: "Requisitions", value: String(model.requisitions.length), detail: `${model.requisitions.filter((row) => row.status === "pending").length} pending`, status: "pending" },
    { metric: "Assets", value: String(model.assets.length), detail: formatCurrency(model.assets.reduce((sum, row) => sum + row.currentValuePaise, 0)), status: "live" },
    { metric: "Vendors", value: String(model.vendors.length), detail: "Supplier master", status: "live" },
  ];
  return <OperationsPage title="Inventory & Assets" subtitle="Stock, requisitions, vendors, and fixed assets" actions={<div className="flex gap-2"><RouteButton href="/inventory/items">Items</RouteButton><RouteButton href="/inventory/stock">Stock</RouteButton><RouteButton href="/inventory/assets">Assets</RouteButton></div>} rows={rows} empty="No inventory data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

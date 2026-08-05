import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function AssetsPage() {
  const ctx = await requirePermission("inventory.assets.read");
  const model = await listInventoryModel(ctx.tenantId);
  const categoryName = new Map(model.categories.map((category) => [category.id, category.name]));
  return <OperationsPage title="Asset Register" subtitle="Fixed assets and depreciation values" rows={model.assets} empty="No assets yet." columns={[
    { label: "Code", value: (row) => <Link className="text-primary" href={`/inventory/assets/${row.id}`}>{row.assetCode}</Link> },
    { label: "Name", value: (row) => row.name },
    { label: "Category", value: (row) => categoryName.get(row.categoryId) ?? "—" },
    { label: "Location", value: (row) => row.location ?? "—" },
    { label: "Purchase cost", value: (row) => formatCurrency(row.purchaseCostPaise) },
    { label: "Current value", value: (row) => formatCurrency(row.currentValuePaise) },
    { label: "Condition", value: (row) => <StatusBadge status={row.condition} /> },
  ]} />;
}

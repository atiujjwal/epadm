import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { calculateCurrentValue, listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage } from "../../../academics/phase4-view";

export default async function AssetDetailPage({ params }: { params: Promise<{ assetId: string }> }) {
  const ctx = await requirePermission("inventory.assets.read");
  const { assetId } = await params;
  const model = await listInventoryModel(ctx.tenantId);
  const asset = model.assets.find((row) => row.id === assetId);
  if (!asset) notFound();
  const rows = Array.from({ length: asset.usefulLifeYears + 1 }, (_, year) => {
    const asOf = new Date(asset.purchaseDate);
    asOf.setFullYear(asOf.getFullYear() + year);
    return { year, value: calculateCurrentValue(asset.purchaseCostPaise, asset.salvageValuePaise, asset.usefulLifeYears, new Date(asset.purchaseDate), asset.depreciationMethod as "straight_line" | "written_down_value", asOf) };
  });
  return <OperationsPage title={asset.name} subtitle={`${asset.assetCode} · ${asset.depreciationMethod} depreciation`} rows={rows} empty="No depreciation schedule." columns={[
    { label: "Year", value: (row) => row.year },
    { label: "Book value", value: (row) => formatCurrency(row.value) },
  ]} />;
}

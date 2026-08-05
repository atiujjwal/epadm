import { requirePermission } from "@/lib/auth/guards";
import { listInventoryModel } from "@/lib/phase10/inventory";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function VendorsPage() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  return <OperationsPage title="Vendors" subtitle="Supplier master data" rows={model.vendors} empty="No vendors yet." columns={[
    { label: "Code", value: (row) => row.vendorCode ?? "—" },
    { label: "Name", value: (row) => row.name },
    { label: "Contact", value: (row) => row.contactName ?? "—" },
    { label: "Phone", value: (row) => row.phone ?? "—" },
    { label: "GSTIN", value: (row) => row.gstin ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
  ]} />;
}

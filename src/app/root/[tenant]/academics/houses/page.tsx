import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel } from "@/lib/phase4/academics";
import { OperationsPage, StatusBadge } from "../phase4-view";

export default async function HousesPage() {
  const ctx = await requirePermission("academics.read");
  const model = await listAcademicModel(ctx.tenantId);
  return <OperationsPage title="Houses" subtitle={`${model.houses.length} houses`} rows={model.houses} empty="No school houses are configured." columns={[
    { label: "House", value: (row) => <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: row.color ?? "transparent" }} />{row.name}</span> },
    { label: "Motto", value: (row) => row.motto ?? "Not set" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "archived"} /> },
  ]} />;
}

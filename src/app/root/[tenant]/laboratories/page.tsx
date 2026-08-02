import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel } from "@/lib/phase9/laboratories";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function LaboratoriesPage() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  const lowStock = model.consumables.filter((item) => Number(item.quantityOnHand) <= Number(item.reorderLevel)).length;
  const rows = [
    { metric: "Laboratories", value: String(model.labs.length), detail: `${model.labs.filter((lab) => lab.status === "active").length} active`, status: "live" },
    { metric: "Bookings", value: String(model.bookings.length), detail: "Scheduled lab sessions", status: "live" },
    { metric: "Equipment", value: String(model.equipment.length), detail: "Tracked assets", status: "live" },
    { metric: "Low stock", value: String(lowStock), detail: "Consumables at/below reorder level", status: lowStock ? "open" : "clear" },
  ];
  return <OperationsPage title="Laboratories" subtitle="Lab catalog, bookings, equipment, consumables, and safety" actions={<div className="flex gap-2"><RouteButton href="/laboratories/bookings">Bookings</RouteButton><RouteButton href="/laboratories/equipment">Equipment</RouteButton><RouteButton href="/laboratories/consumables">Consumables</RouteButton></div>} rows={rows} empty="No laboratory data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

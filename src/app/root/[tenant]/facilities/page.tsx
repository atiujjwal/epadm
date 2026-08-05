import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel } from "@/lib/phase10/facilities";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function FacilitiesPage() {
  const ctx = await requirePermission("facilities.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  const activeVisitors = model.visitors.filter((row) => !row.checkOut);
  const rows = [
    { metric: "Spaces", value: String(model.spaces.length), detail: `${model.spaces.filter((row) => row.isBookable).length} bookable`, status: "live" },
    { metric: "Bookings", value: String(model.bookings.length), detail: "Space reservations", status: "live" },
    { metric: "Open work orders", value: String(model.workOrders.filter((row) => row.status !== "completed").length), detail: "Maintenance queue", status: "open" },
    { metric: "Active visitors", value: String(activeVisitors.length), detail: "Currently signed in", status: activeVisitors.length ? "active" : "clear" },
  ];
  return <OperationsPage title="Facilities & Safety" subtitle="Spaces, bookings, work orders, visitors, and health" actions={<div className="flex gap-2"><RouteButton href="/facilities/spaces">Spaces</RouteButton><RouteButton href="/facilities/work-orders">Work Orders</RouteButton><RouteButton href="/facilities/visitors">Visitors</RouteButton></div>} rows={rows} empty="No facilities data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

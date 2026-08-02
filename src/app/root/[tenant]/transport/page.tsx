import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listTransportModel } from "@/lib/phase9/transport";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function TransportPage() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  const rows = [
    { metric: "Fleet", value: String(model.fleet.length), detail: `${model.fleet.filter((v) => v.status === "active").length} active vehicles`, status: "live" },
    { metric: "Routes", value: String(model.routes.length), detail: `${model.stops.length} stops configured`, status: "live" },
    { metric: "Allocations", value: String(model.allocations.length), detail: "Student transport subscriptions", status: "live" },
    { metric: "Maintenance", value: String(model.maintenance.length), detail: "Service and expense records", status: "live" },
    { metric: "Monthly route fee", value: formatCurrency(model.routes.reduce((sum, route) => sum + route.monthlyFeePaise, 0)), detail: "Sum of route base fees", status: "live" },
  ];
  return <OperationsPage title="Transport" subtitle="Fleet, routes, allocations, tracking, and maintenance" actions={<div className="flex gap-2"><RouteButton href="/transport/fleet">Fleet</RouteButton><RouteButton href="/transport/routes">Routes</RouteButton><RouteButton href="/transport/allocations">Allocations</RouteButton></div>} rows={rows} empty="No transport data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

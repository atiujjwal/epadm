import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listTransportModel } from "@/lib/phase9/transport";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function TransportRoutesPage() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  const rows = model.routes.map((route) => ({ ...route, stops: model.stops.filter((stop) => stop.routeId === route.id).length }));
  return <OperationsPage title="Routes" subtitle={`${model.routes.length} live routes`} rows={rows} empty="No routes configured." columns={[
    { label: "Code", value: (row) => row.routeCode },
    { label: "Route", value: (row) => row.name },
    { label: "Stops", value: (row) => row.stops },
    { label: "Fee", value: (row) => formatCurrency(row.monthlyFeePaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

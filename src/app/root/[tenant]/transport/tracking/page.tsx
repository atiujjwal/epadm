import { requirePermission } from "@/lib/auth/guards";
import { listTransportModel } from "@/lib/phase9/transport";
import { OperationsPage } from "../../academics/phase4-view";

export default async function TransportTrackingPage() {
  const ctx = await requirePermission("transport.tracking.read");
  const model = await listTransportModel(ctx.tenantId);
  return <OperationsPage title="GPS Tracking" subtitle={`${model.latestTracking.length} recent tracking events`} rows={model.latestTracking} empty="No GPS tracking events received yet." columns={[
    { label: "Vehicle", value: (row) => row.externalVehicleId },
    { label: "Latitude", value: (row) => String(row.latitude) },
    { label: "Longitude", value: (row) => String(row.longitude) },
    { label: "Speed", value: (row) => row.speed ?? "-" },
    { label: "Recorded", value: (row) => row.recordedAt.toLocaleString() },
  ]} />;
}

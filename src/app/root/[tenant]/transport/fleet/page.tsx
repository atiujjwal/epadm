import { requirePermission } from "@/lib/auth/guards";
import { listTransportModel } from "@/lib/phase9/transport";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function TransportFleetPage() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  return <OperationsPage title="Fleet" subtitle={`${model.fleet.length} vehicles`} rows={model.fleet} empty="No vehicles configured." columns={[
    { label: "Code", value: (row) => row.code },
    { label: "Number", value: (row) => row.numberPlate },
    { label: "Driver", value: (row) => row.driverName ?? "-" },
    { label: "Capacity", value: (row) => row.capacity || "-" },
    { label: "GPS", value: (row) => row.gpsDeviceId ?? "-" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

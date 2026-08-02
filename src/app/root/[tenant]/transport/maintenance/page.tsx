import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listTransportModel } from "@/lib/phase9/transport";
import { OperationsPage } from "../../academics/phase4-view";

export default async function TransportMaintenancePage() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  const vehicleCode = new Map(model.fleet.map((vehicle) => [vehicle.id, vehicle.code]));
  return <OperationsPage title="Vehicle Maintenance" subtitle={`${model.maintenance.length} records`} rows={model.maintenance} empty="No maintenance records yet." columns={[
    { label: "Vehicle", value: (row) => vehicleCode.get(row.vehicleId) ?? row.vehicleId },
    { label: "Type", value: (row) => row.maintenanceType },
    { label: "Date", value: (row) => String(row.serviceDate) },
    { label: "Amount", value: (row) => formatCurrency(row.amountPaise) },
    { label: "Next due", value: (row) => row.nextDueDate ? String(row.nextDueDate) : "-" },
  ]} />;
}

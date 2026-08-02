import { listVehicles } from "@/lib/admin/vehicles";
import { getCtx } from "@/lib/context";
import { VehiclesWorkspace } from "./vehicles-workspace";

export default async function VehiclesPage() {
  const ctx = await getCtx();
  const vehicles = await listVehicles(ctx.tenantId);

  return <VehiclesWorkspace initialVehicles={vehicles} />;
}

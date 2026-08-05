import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel } from "@/lib/phase10/facilities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function FacilitySpacesPage() {
  const ctx = await requirePermission("facilities.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  return <OperationsPage title="Facility Spaces" subtitle="Bookable halls, grounds, rooms, and shared spaces" rows={model.spaces} empty="No spaces yet." columns={[
    { label: "Name", value: (row) => row.name },
    { label: "Type", value: (row) => row.spaceType },
    { label: "Capacity", value: (row) => row.capacity },
    { label: "Location", value: (row) => row.location ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
  ]} />;
}

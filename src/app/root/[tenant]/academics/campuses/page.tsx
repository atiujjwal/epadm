import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel } from "@/lib/phase4/academics";
import { OperationsPage, StatusBadge } from "../phase4-view";

export default async function CampusesPage() {
  const ctx = await requirePermission("academics.read");
  const model = await listAcademicModel(ctx.tenantId);
  return <OperationsPage title="Campuses & Rooms" subtitle={`${model.campuses.length} campuses, ${model.rooms.length} rooms`} rows={model.rooms} empty="No rooms have been configured." columns={[
    { label: "Room", value: (row) => row.name },
    { label: "Campus", value: (row) => model.campuses.find((campus) => campus.id === row.campusId)?.name ?? "Unassigned" },
    { label: "Type", value: (row) => row.roomType },
    { label: "Capacity", value: (row) => row.capacity ?? "Not set" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "archived"} /> },
  ]} />;
}

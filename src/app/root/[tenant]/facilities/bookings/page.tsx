import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel } from "@/lib/phase10/facilities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function FacilityBookingsPage() {
  const ctx = await requirePermission("facilities.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  const spaceName = new Map(model.spaces.map((space) => [space.id, space.name]));
  return <OperationsPage title="Facility Bookings" subtitle="Calendar-backed space reservations" rows={model.bookings} empty="No bookings yet." columns={[
    { label: "Space", value: (row) => spaceName.get(row.spaceId) ?? "—" },
    { label: "Date", value: (row) => row.bookingDate },
    { label: "Time", value: (row) => `${row.startTime}–${row.endTime}` },
    { label: "Purpose", value: (row) => row.purpose },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

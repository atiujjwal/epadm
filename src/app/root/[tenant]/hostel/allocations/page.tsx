import { requirePermission } from "@/lib/auth/guards";
import { listHostelModel } from "@/lib/phase10/hostel";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function HostelAllocationsPage() {
  const ctx = await requirePermission("hostel.allocations.manage");
  const model = await listHostelModel(ctx.tenantId);
  const roomNumber = new Map(model.rooms.map((room) => [room.id, room.roomNumber]));
  return <OperationsPage title="Hostel Allocations" subtitle="Student hostel allocation lifecycle" rows={model.allocations} empty="No allocations yet." columns={[
    { label: "Student", value: (row) => row.studentName },
    { label: "Admission", value: (row) => row.admissionNumber },
    { label: "Room", value: (row) => roomNumber.get(row.roomId) ?? "—" },
    { label: "Check-in", value: (row) => row.checkInDate },
    { label: "Check-out", value: (row) => row.checkOutDate ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

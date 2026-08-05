import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listHostelModel } from "@/lib/phase10/hostel";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function HostelRoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const ctx = await requirePermission("hostel.read");
  const { roomId } = await params;
  const model = await listHostelModel(ctx.tenantId);
  const room = model.rooms.find((row) => row.id === roomId);
  if (!room) notFound();
  const building = model.buildings.find((row) => row.id === room.buildingId);
  const occupants = model.allocations.filter((row) => row.roomId === room.id);
  return <OperationsPage title={`Room ${room.roomNumber}`} subtitle={`${building?.name ?? "Hostel"} · ${room.currentOccupancy}/${room.capacity} occupied · ${formatCurrency(room.monthlyFeePaise)}/month`} rows={occupants} empty="No occupants yet." columns={[
    { label: "Student", value: (row) => row.studentName },
    { label: "Admission", value: (row) => row.admissionNumber },
    { label: "Check-in", value: (row) => row.checkInDate },
    { label: "Check-out", value: (row) => row.checkOutDate ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

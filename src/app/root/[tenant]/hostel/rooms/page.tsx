import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listHostelModel } from "@/lib/phase10/hostel";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function HostelRoomsPage() {
  const ctx = await requirePermission("hostel.read");
  const model = await listHostelModel(ctx.tenantId);
  const buildingName = new Map(model.buildings.map((building) => [building.id, building.name]));
  return <OperationsPage title="Hostel Rooms" subtitle={`${model.rooms.length} live rooms`} rows={model.rooms} empty="No rooms configured." columns={[
    { label: "Building", value: (row) => buildingName.get(row.buildingId) ?? "—" },
    { label: "Room", value: (row) => <Link className="text-primary" href={`/hostel/rooms/${row.id}`}>{row.roomNumber}</Link> },
    { label: "Floor", value: (row) => row.floor },
    { label: "Type", value: (row) => row.roomType },
    { label: "Occupancy", value: (row) => `${row.currentOccupancy}/${row.capacity}` },
    { label: "Monthly fee", value: (row) => formatCurrency(row.monthlyFeePaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listHostelModel } from "@/lib/phase10/hostel";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function HostelPage() {
  const ctx = await requirePermission("hostel.read");
  const model = await listHostelModel(ctx.tenantId);
  const capacity = model.rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupancy = model.rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
  const rows = [
    { metric: "Buildings", value: String(model.buildings.length), detail: `${model.buildings.filter((row) => row.isActive).length} active`, status: "live" },
    { metric: "Rooms", value: String(model.rooms.length), detail: "Hostel room inventory", status: "live" },
    { metric: "Capacity", value: String(capacity), detail: `${occupancy} occupied`, status: "live" },
    { metric: "Occupancy", value: capacity ? `${Math.round((occupancy / capacity) * 100)}%` : "0%", detail: "Current resident load", status: occupancy >= capacity && capacity > 0 ? "full" : "available" },
    { metric: "Monthly fee base", value: formatCurrency(model.rooms.reduce((sum, room) => sum + room.monthlyFeePaise, 0)), detail: "Sum across rooms", status: "live" },
  ];
  return <OperationsPage title="Hostel" subtitle="Buildings, rooms, allocations, and leave passes" actions={<div className="flex gap-2"><RouteButton href="/hostel/rooms">Rooms</RouteButton><RouteButton href="/hostel/allocations">Allocations</RouteButton><RouteButton href="/hostel/leave-passes">Leave Passes</RouteButton></div>} rows={rows} empty="No hostel data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

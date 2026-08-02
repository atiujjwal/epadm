import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { getStudentTransportSummary } from "@/lib/phase9/transport";
import { OperationsPage, RouteButton, StatusBadge } from "../../../academics/phase4-view";

type Props = { params: Promise<{ studentId: string }> };

export default async function StudentTransportPage({ params }: Props) {
  const ctx = await requirePermission("transport.read");
  const { studentId } = await params;
  const data = await getStudentTransportSummary(ctx.tenantId, studentId);
  const stopName = new Map(data.stops.map((stop) => [stop.id, stop.stopName]));
  return <OperationsPage title="Student Transport" subtitle={`${data.allocations.length} allocation records`} actions={<RouteButton href="/transport/allocations">Manage allocations</RouteButton>} rows={data.allocations} empty="No transport allocation for this student." columns={[
    { label: "Route", value: (row) => `${row.routeCode} · ${row.routeName}` },
    { label: "Pickup", value: (row) => row.pickupStopId ? stopName.get(row.pickupStopId) ?? "-" : "-" },
    { label: "Drop", value: (row) => row.dropStopId ? stopName.get(row.dropStopId) ?? "-" : "-" },
    { label: "From", value: (row) => String(row.startDate) },
    { label: "Monthly fee", value: (row) => formatCurrency(row.monthlyFeePaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

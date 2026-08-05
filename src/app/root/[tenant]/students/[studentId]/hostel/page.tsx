import { requirePermission } from "@/lib/auth/guards";
import { getStudentHostelSummary } from "@/lib/phase10/hostel";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function StudentHostelPage({ params }: { params: Promise<{ studentId: string }> }) {
  const ctx = await requirePermission("hostel.read");
  const { studentId } = await params;
  const summary = await getStudentHostelSummary(ctx.tenantId, studentId);
  return <OperationsPage title="Hostel" subtitle="Current and historical hostel allocations" rows={summary.allocations} empty="No hostel allocation for this student." columns={[
    { label: "Building", value: (row) => row.buildingName },
    { label: "Room", value: (row) => row.roomNumber },
    { label: "Check-in", value: (row) => row.checkInDate },
    { label: "Check-out", value: (row) => row.checkOutDate ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

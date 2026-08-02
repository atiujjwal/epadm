import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel } from "@/lib/phase9/laboratories";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LabBookingsPage() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  return <OperationsPage title="Lab Bookings" subtitle={`${model.bookings.length} bookings`} rows={model.bookings} empty="No lab bookings yet." columns={[
    { label: "Lab", value: (row) => row.labName },
    { label: "Session", value: (row) => row.topic ?? row.session },
    { label: "Class", value: (row) => row.classLabel ?? "-" },
    { label: "Date", value: (row) => row.bookingDate ? String(row.bookingDate) : row.scheduledAt.toLocaleDateString() },
    { label: "Period", value: (row) => row.periodName ?? "-" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

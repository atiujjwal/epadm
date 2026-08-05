import { requireRole } from "@/lib/auth/guards";
import { getParentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, StatGrid, Status } from "../../phase11-view";

export default async function ParentAttendancePage() {
  const ctx = await requireRole(["parent"]);
  const model = await getParentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="Attendance" description="Daily attendance."><EmptyPortal message="No linked child attendance." /></PortalShell>;
  return <PortalShell title="Attendance" description="Recent attendance and leave requests."><StatGrid stats={[{ label: "Attendance", value: model.data.attendancePercent == null ? "-" : `${model.data.attendancePercent}%` }, { label: "Absences", value: model.data.attendance.filter((row) => row.status === "absent").length }, { label: "Leaves", value: model.data.leaves.length }]} /><SimpleTable rows={model.data.attendance} columns={[{ label: "Date", value: (row) => row.date }, { label: "Status", value: (row) => <Status value={row.status} /> }, { label: "Notes", value: (row) => row.notes ?? "-" }]} /></PortalShell>;
}

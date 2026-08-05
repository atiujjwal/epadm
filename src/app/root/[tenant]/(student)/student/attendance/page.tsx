import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, StatGrid, Status } from "../../../phase11-view";

export default async function StudentAttendancePage() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="My attendance" description="Recent attendance."><EmptyPortal message="No student profile linked." /></PortalShell>;
  return <PortalShell title="My attendance" description="Recent attendance."><StatGrid stats={[{ label: "Attendance", value: model.data.attendancePercent == null ? "-" : `${model.data.attendancePercent}%` }, { label: "Absences", value: model.data.attendance.filter((row) => row.status === "absent").length }]} /><SimpleTable rows={model.data.attendance} columns={[{ label: "Date", value: (row) => row.date }, { label: "Status", value: (row) => <Status value={row.status} /> }, { label: "Notes", value: (row) => row.notes ?? "-" }]} /></PortalShell>;
}

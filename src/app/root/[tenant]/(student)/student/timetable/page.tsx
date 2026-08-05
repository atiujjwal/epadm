import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable } from "../../../phase11-view";

export default async function StudentTimetablePage() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="My timetable" description="Published class schedule."><EmptyPortal message="No student profile linked." /></PortalShell>;
  return <PortalShell title="My timetable" description="Published class schedule."><SimpleTable rows={model.data.timetable.map((row, id) => ({ id: String(id), ...row }))} columns={[{ label: "Day", value: (row) => row.dayOfWeek }, { label: "Period", value: (row) => row.periodName }, { label: "Time", value: (row) => `${row.startTime}-${row.endTime}` }, { label: "Subject", value: (row) => row.subjectName }, { label: "Teacher", value: (row) => row.teacherName }, { label: "Room", value: (row) => row.roomName ?? "-" }]} /></PortalShell>;
}

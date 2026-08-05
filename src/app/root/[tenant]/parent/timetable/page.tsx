import { requireRole } from "@/lib/auth/guards";
import { getParentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable } from "../../phase11-view";

export default async function ParentTimetablePage() {
  const ctx = await requireRole(["parent"]);
  const model = await getParentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="Timetable" description="Class schedule."><EmptyPortal message="No linked child timetable." /></PortalShell>;
  return <PortalShell title="Timetable" description="Published class timetable."><SimpleTable rows={model.data.timetable.map((row, id) => ({ id: String(id), ...row }))} columns={[{ label: "Day", value: (row) => row.dayOfWeek }, { label: "Period", value: (row) => row.periodName }, { label: "Time", value: (row) => `${row.startTime}-${row.endTime}` }, { label: "Subject", value: (row) => row.subjectName }, { label: "Teacher", value: (row) => row.teacherName }, { label: "Room", value: (row) => row.roomName ?? "-" }]} /></PortalShell>;
}

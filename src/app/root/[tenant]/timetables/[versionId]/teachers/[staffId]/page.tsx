import { requirePermission } from "@/lib/auth/guards";
import { listTimetableModel } from "@/lib/phase4/academics";
import { OperationsPage } from "../../../../academics/phase4-view";

type Props = { params: Promise<{ versionId: string; staffId: string }> };

export default async function TeacherTimetablePage({ params }: Props) {
  const ctx = await requirePermission("timetables.read");
  const { versionId, staffId } = await params;
  const model = await listTimetableModel(ctx.tenantId, versionId);
  const teacher = model.staff.find((item) => item.id === staffId);
  const slots = model.slots.filter((slot) => slot.staffId === staffId);
  return <OperationsPage title={`${teacher?.fullName ?? "Teacher"} Schedule`} subtitle={`${slots.length} assigned slots`} rows={slots} empty="No slots assigned to this teacher." columns={[
    { label: "Day", value: (row) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][row.dayOfWeek] },
    { label: "Period", value: (row) => model.periods.find((period) => period.id === row.periodId)?.name ?? "Unknown" },
    { label: "Section", value: (row) => model.sections.find((section) => section.id === row.sectionId)?.name ?? "Unknown" },
    { label: "Room", value: (row) => model.rooms.find((room) => room.id === row.roomId)?.name ?? "Unassigned" },
  ]} />;
}

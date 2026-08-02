import { requirePermission } from "@/lib/auth/guards";
import { listTimetableModel } from "@/lib/phase4/academics";
import { OperationsPage } from "../../../../academics/phase4-view";

type Props = { params: Promise<{ versionId: string; roomId: string }> };

export default async function RoomTimetablePage({ params }: Props) {
  const ctx = await requirePermission("timetables.read");
  const { versionId, roomId } = await params;
  const model = await listTimetableModel(ctx.tenantId, versionId);
  const room = model.rooms.find((item) => item.id === roomId);
  const slots = model.slots.filter((slot) => slot.roomId === roomId);
  return <OperationsPage title={`${room?.name ?? "Room"} Schedule`} subtitle={`${slots.length} occupied slots`} rows={slots} empty="No slots assigned to this room." columns={[
    { label: "Day", value: (row) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][row.dayOfWeek] },
    { label: "Period", value: (row) => model.periods.find((period) => period.id === row.periodId)?.name ?? "Unknown" },
    { label: "Section", value: (row) => model.sections.find((section) => section.id === row.sectionId)?.name ?? "Unknown" },
    { label: "Teacher", value: (row) => model.staff.find((staff) => staff.id === row.staffId)?.fullName ?? "Unknown" },
  ]} />;
}

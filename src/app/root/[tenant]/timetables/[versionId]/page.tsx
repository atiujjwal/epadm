import { requirePermission } from "@/lib/auth/guards";
import { listTimetableModel } from "@/lib/phase4/academics";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

type Props = { params: Promise<{ versionId: string }> };

export default async function TimetableGridPage({ params }: Props) {
  const ctx = await requirePermission("timetables.read");
  const { versionId } = await params;
  const model = await listTimetableModel(ctx.tenantId, versionId);
  const version = model.versions.find((item) => item.id === versionId);
  return <OperationsPage title={version?.name ?? "Timetable"} subtitle={`${model.slots.length} slots, ${version?.status ?? "draft"}`} rows={model.slots} empty="No slots assigned yet." columns={[
    { label: "Day", value: (row) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][row.dayOfWeek] },
    { label: "Period", value: (row) => model.periods.find((period) => period.id === row.periodId)?.name ?? "Unknown" },
    { label: "Section", value: (row) => model.sections.find((section) => section.id === row.sectionId)?.name ?? "Unknown" },
    { label: "Subject", value: (row) => {
      const offering = model.offerings.find((item) => item.id === row.offeringId);
      return model.subjects.find((subject) => subject.id === offering?.subjectId)?.name ?? "Unknown";
    } },
    { label: "Teacher", value: (row) => model.staff.find((staff) => staff.id === row.staffId)?.fullName ?? "Unknown" },
    { label: "Status", value: () => <StatusBadge status={version?.status} /> },
  ]} />;
}

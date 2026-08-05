import { requirePermission } from "@/lib/auth/guards";
import { getStudentActivitiesSummary } from "@/lib/phase10/activities";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function StudentActivitiesPage({ params }: { params: Promise<{ studentId: string }> }) {
  const ctx = await requirePermission("activities.read");
  const { studentId } = await params;
  const summary = await getStudentActivitiesSummary(ctx.tenantId, studentId);
  const rows = [
    ...summary.memberships.map((row) => ({ type: "Membership", title: row.activityName, detail: `${row.role} · ${row.academicYearName}`, date: row.joinedDate, status: row.status })),
    ...summary.achievements.map((row) => ({ type: "Achievement", title: row.title, detail: `${row.level}${row.position ? ` · ${row.position}` : ""}`, date: row.achievementDate, status: row.level })),
  ];
  return <OperationsPage title="Activities" subtitle="Activity memberships and achievements" rows={rows} empty="No activity records for this student." columns={[
    { label: "Type", value: (row) => row.type },
    { label: "Title", value: (row) => row.title },
    { label: "Detail", value: (row) => row.detail },
    { label: "Date", value: (row) => row.date },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listActivitiesModel } from "@/lib/phase10/activities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function StudentAchievementsPage() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  const activityName = new Map(model.activities.map((activity) => [activity.id, activity.name]));
  return <OperationsPage title="Student Achievements" subtitle="Awards, positions, and certificates" rows={model.achievements} empty="No achievements yet." columns={[
    { label: "Student", value: (row) => row.studentName },
    { label: "Activity", value: (row) => row.activityId ? activityName.get(row.activityId) ?? "—" : "—" },
    { label: "Title", value: (row) => row.title },
    { label: "Level", value: (row) => <StatusBadge status={row.level} /> },
    { label: "Position", value: (row) => row.position ?? "—" },
    { label: "Date", value: (row) => row.achievementDate },
  ]} />;
}

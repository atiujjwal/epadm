import { requirePermission } from "@/lib/auth/guards";
import { listActivitiesModel } from "@/lib/phase10/activities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function ActivityEventsPage() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  const activityName = new Map(model.activities.map((activity) => [activity.id, activity.name]));
  return <OperationsPage title="Activity Events" subtitle="Competition and participation calendar" rows={model.events} empty="No events yet." columns={[
    { label: "Activity", value: (row) => activityName.get(row.activityId) ?? "—" },
    { label: "Event", value: (row) => row.name },
    { label: "Date", value: (row) => row.eventDate },
    { label: "Level", value: (row) => <StatusBadge status={row.level} /> },
    { label: "Venue", value: (row) => row.venue ?? "—" },
    { label: "Result", value: (row) => row.result ?? "—" },
  ]} />;
}

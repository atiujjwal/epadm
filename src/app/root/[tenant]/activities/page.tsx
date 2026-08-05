import { requirePermission } from "@/lib/auth/guards";
import { listActivitiesModel } from "@/lib/phase10/activities";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function ActivitiesPage() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  const rows = [
    { metric: "Activities", value: String(model.activities.length), detail: `${model.activities.filter((row) => row.isActive).length} active`, status: "live" },
    { metric: "Members", value: String(model.members.length), detail: `${model.members.filter((row) => row.status === "active").length} current`, status: "live" },
    { metric: "Events", value: String(model.events.length), detail: "Sports and co-curricular events", status: "live" },
    { metric: "Achievements", value: String(model.achievements.length), detail: "Student awards and certificates", status: "live" },
  ];
  return <OperationsPage title="Activities" subtitle="Sports, clubs, events, members, and achievements" actions={<div className="flex gap-2"><RouteButton href="/activities/catalog">Catalog</RouteButton><RouteButton href="/activities/events">Events</RouteButton><RouteButton href="/activities/achievements">Achievements</RouteButton></div>} rows={rows} empty="No activity data yet." columns={[
    { label: "Metric", value: (row) => row.metric },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

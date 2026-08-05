import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listActivitiesModel } from "@/lib/phase10/activities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function ActivityCatalogPage() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  const membersByActivity = new Map<string, number>();
  for (const member of model.members) membersByActivity.set(member.activityId, (membersByActivity.get(member.activityId) ?? 0) + 1);
  return <OperationsPage title="Activity Catalog" subtitle="Clubs, teams, and co-curricular programs" rows={model.activities} empty="No activities yet." columns={[
    { label: "Activity", value: (row) => <Link className="text-primary" href={`/activities/catalog/${row.id}`}>{row.name}</Link> },
    { label: "Type", value: (row) => row.activityType },
    { label: "Coordinator", value: (row) => row.coordinatorName ?? "—" },
    { label: "Members", value: (row) => membersByActivity.get(row.id) ?? 0 },
    { label: "Schedule", value: (row) => row.schedule ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
  ]} />;
}

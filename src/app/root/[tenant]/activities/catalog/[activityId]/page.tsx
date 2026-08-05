import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { listActivitiesModel } from "@/lib/phase10/activities";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function ActivityDetailPage({ params }: { params: Promise<{ activityId: string }> }) {
  const ctx = await requirePermission("activities.read");
  const { activityId } = await params;
  const model = await listActivitiesModel(ctx.tenantId);
  const activity = model.activities.find((row) => row.id === activityId);
  if (!activity) notFound();
  const rows = model.members.filter((row) => row.activityId === activityId);
  return <OperationsPage title={activity.name} subtitle={`${activity.activityType} · ${activity.schedule ?? "No schedule configured"}`} rows={rows} empty="No members yet." columns={[
    { label: "Student", value: (row) => row.studentName },
    { label: "Admission", value: (row) => row.admissionNumber },
    { label: "Role", value: (row) => row.role },
    { label: "Academic year", value: (row) => row.academicYearName },
    { label: "Joined", value: (row) => row.joinedDate },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

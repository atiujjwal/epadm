import { requirePermission } from "@/lib/auth/guards";
import { listCurriculum } from "@/lib/phase4/academics";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function SubjectsPage() {
  const ctx = await requirePermission("curriculum.read");
  const curriculum = await listCurriculum(ctx.tenantId);
  return <OperationsPage title="Subjects" subtitle={`${curriculum.subjects.length} subjects preserved from the existing catalog`} actions={<RouteButton href="/curriculum/offerings">Offerings</RouteButton>} rows={curriculum.subjects} empty="No subjects have been created." columns={[
    { label: "Subject", value: (row) => row.name },
    { label: "Code", value: (row) => row.code },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

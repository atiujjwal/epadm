import { requirePermission } from "@/lib/auth/guards";
import { listCurriculum } from "@/lib/phase4/academics";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function FrameworksPage() {
  const ctx = await requirePermission("curriculum.read");
  const curriculum = await listCurriculum(ctx.tenantId);
  return <OperationsPage title="Curriculum Frameworks" subtitle={`${curriculum.frameworks.length} frameworks`} rows={curriculum.frameworks} empty="No frameworks configured yet." columns={[
    { label: "Name", value: (row) => row.name },
    { label: "Abbreviation", value: (row) => row.abbreviation ?? "Not set" },
    { label: "Description", value: (row) => row.description ?? "No description" },
    { label: "Status", value: (row) => <StatusBadge status={row.isActive ? "active" : "archived"} /> },
  ]} />;
}

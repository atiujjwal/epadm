import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function AssessmentPlansPage() {
  const ctx = await requirePermission("assessments.plans.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Assessment Plans" subtitle={`${model.types.length} assessment types, ${model.components.length} weighted components`} actions={<RouteButton href="/assessments/settings">Grade scales</RouteButton>} rows={model.plans} empty="No assessment plans configured." columns={[
    { label: "Plan", value: (row) => row.name },
    { label: "Scope", value: (row) => row.appliesToClass ? model.classes.find((item) => item.id === row.appliesToClass)?.name ?? "Class" : "All classes" },
    { label: "Components", value: (row) => model.components.filter((item) => item.planId === row.id).map((item) => `${model.types.find((type) => type.id === item.assessmentTypeId)?.code ?? "Type"} ${item.weightPercent}%`).join(", ") || "None" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function AssessmentsPage() {
  const ctx = await requirePermission("assessments.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Assessments & Results" subtitle={`${model.plans.length} plans, ${model.events.length} scheduled events`} actions={<RouteButton href="/assessments/plans">Assessment plans</RouteButton>} rows={model.plans} empty="Create an assessment plan to begin an examination cycle." columns={[
    { label: "Plan", value: (row) => row.name },
    { label: "Academic year", value: (row) => model.years.find((year) => year.id === row.academicYearId)?.name ?? "Unknown" },
    { label: "Term", value: (row) => model.terms.find((term) => term.id === row.termId)?.name ?? "All terms" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

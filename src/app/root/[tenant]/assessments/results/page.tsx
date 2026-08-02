import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, RouteButton } from "../../academics/phase4-view";

export default async function ResultsPage() {
  const ctx = await requirePermission("assessments.results.read");
  const model = await listAssessmentModel(ctx.tenantId);
  const rows = model.plans.flatMap((plan) => model.sections.map((section) => ({ plan, section })));
  return <OperationsPage title="Results" subtitle="Compute, review, publish, and export section results" actions={<RouteButton href="/assessments/report-cards">Report cards</RouteButton>} rows={rows} empty="No plan and section combinations available." columns={[
    { label: "Plan", value: (row) => row.plan.name },
    { label: "Section", value: (row) => row.section.name },
    { label: "Year", value: (row) => model.years.find((year) => year.id === row.plan.academicYearId)?.name ?? "Unknown" },
    { label: "Open", value: (row) => <RouteButton href={`/assessments/results/${row.plan.id}/${row.section.id}`}>View grid</RouteButton> },
  ]} />;
}

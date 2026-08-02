import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function ReportCardsPage() {
  const ctx = await requirePermission("assessments.report-cards.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Report Cards" subtitle={`${model.generations.length} generation records`} actions={<RouteButton href="/assessments/report-cards/templates">Templates</RouteButton>} rows={model.generations} empty="No report cards generated yet." columns={[
    { label: "Student", value: (row) => row.studentId.slice(0, 8) },
    { label: "Plan", value: (row) => model.plans.find((plan) => plan.id === row.planId)?.name ?? "Unknown" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "PDF", value: (row) => row.pdfUrl ? <a className="text-primary underline-offset-4 hover:underline" href={row.pdfUrl}>Download</a> : "Not ready" },
  ]} />;
}

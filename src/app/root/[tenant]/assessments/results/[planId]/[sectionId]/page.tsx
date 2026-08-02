import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel, listSectionResults } from "@/lib/phase6/assessments";
import { OperationsPage, RouteButton, StatusBadge } from "../../../../academics/phase4-view";

type Props = { params: Promise<{ planId: string; sectionId: string }> };

export default async function SectionResultsPage({ params }: Props) {
  const ctx = await requirePermission("assessments.results.read");
  const { planId, sectionId } = await params;
  const [model, results] = await Promise.all([listAssessmentModel(ctx.tenantId), listSectionResults(ctx.tenantId, planId, sectionId)]);
  const plan = model.plans.find((item) => item.id === planId);
  const section = model.sections.find((item) => item.id === sectionId);
  return <OperationsPage title="Section Results" subtitle={`${plan?.name ?? "Plan"} - ${section?.name ?? "Section"}`} actions={<RouteButton href={`/assessments/report-cards/${planId}/${sectionId}`}>Report cards</RouteButton>} rows={results} empty="No computed results yet. Run the compute API for this plan and section." columns={[
    { label: "Student", value: (row) => row.studentName },
    { label: "Subject", value: (row) => row.subjectName },
    { label: "Percentage", value: (row) => row.percentage ?? "Not computed" },
    { label: "Grade", value: (row) => row.gradeLabel ?? "-" },
    { label: "Rank", value: (row) => row.classRank ?? "-" },
    { label: "Status", value: (row) => <StatusBadge status={row.isPublished ? "published" : "draft"} /> },
  ]} />;
}

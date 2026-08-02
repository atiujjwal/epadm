import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel, listSectionResults } from "@/lib/phase6/assessments";
import { OperationsPage, StatusBadge } from "../../../../academics/phase4-view";

type Props = { params: Promise<{ planId: string; sectionId: string }> };

export default async function ReportCardGenerationPage({ params }: Props) {
  const ctx = await requirePermission("assessments.report-cards.read");
  const { planId, sectionId } = await params;
  const [model, results] = await Promise.all([listAssessmentModel(ctx.tenantId), listSectionResults(ctx.tenantId, planId, sectionId)]);
  const studentIds = [...new Set(results.map((row) => row.studentId))];
  const rows = studentIds.map((studentId) => ({ studentId, name: results.find((row) => row.studentId === studentId)?.studentName ?? studentId, generation: model.generations.find((item) => item.studentId === studentId && item.planId === planId), published: results.some((row) => row.studentId === studentId && row.isPublished) }));
  return <OperationsPage title="Generate Report Cards" subtitle="Results must be published before generation" rows={rows} empty="No published results available for report cards." columns={[
    { label: "Student", value: (row) => row.name },
    { label: "Results", value: (row) => <StatusBadge status={row.published ? "published" : "draft"} /> },
    { label: "Report card", value: (row) => <StatusBadge status={row.generation?.status ?? "not_generated"} /> },
    { label: "Download", value: (row) => row.generation?.pdfUrl ? <a className="text-primary underline-offset-4 hover:underline" href={row.generation.pdfUrl}>PDF</a> : "-" },
  ]} />;
}

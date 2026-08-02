import { requirePermission } from "@/lib/auth/guards";
import { getStudentAssessmentSummary } from "@/lib/phase6/assessments";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

type Props = { params: Promise<{ studentId: string }> };

export default async function StudentAssessmentsPage({ params }: Props) {
  const ctx = await requirePermission("assessments.results.read");
  const { studentId } = await params;
  const summary = await getStudentAssessmentSummary(ctx.tenantId, studentId);
  const rows = [
    ...summary.recentMarks.map((mark) => ({
      type: "Mark",
      label: `${mark.subjectName} - ${mark.assessmentType}`,
      value: mark.isAbsent ? "Absent" : mark.isExempt ? "Exempt" : `${mark.marksObtained ?? "-"} / ${mark.maxMarks}`,
      status: mark.examDate,
      link: null as string | null,
    })),
    ...summary.results.map((result) => ({
      type: "Result",
      label: `${result.planName} - ${result.subjectName}`,
      value: `${result.percentage ?? "-"}% ${result.gradeLabel ?? ""}`.trim(),
      status: result.isPublished ? "published" : "draft",
      link: null as string | null,
    })),
    ...summary.reportCards.map((card) => ({
      type: "Report Card",
      label: card.planId.slice(0, 8),
      value: card.status,
      status: card.generatedAt?.toISOString?.() ?? "complete",
      link: card.pdfUrl,
    })),
  ];

  return <OperationsPage title="Student Assessments" subtitle={`${summary.recentMarks.length} recent marks, ${summary.results.length} result rows`} rows={rows} empty="No assessment records for this student yet." columns={[
    { label: "Type", value: (row) => row.type },
    { label: "Record", value: (row) => row.label },
    { label: "Value", value: (row) => row.value },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "File", value: (row) => row.link ? <a className="text-primary underline-offset-4 hover:underline" href={row.link}>Download</a> : "-" },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function MarksPage() {
  const ctx = await requirePermission("assessments.marks.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Marks Entry" subtitle="Select an event via the marks API to enter or finalize marks" rows={model.events} empty="No exam events available for marks entry." columns={[
    { label: "Event", value: (row) => `${model.types.find((type) => type.id === row.assessmentTypeId)?.code ?? "Exam"} - ${row.examDate}` },
    { label: "Max", value: (row) => row.maxMarks },
    { label: "Finalized", value: (row) => <StatusBadge status={row.marksFinalized ? "finalized" : "draft"} /> },
  ]} />;
}

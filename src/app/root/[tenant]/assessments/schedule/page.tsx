import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function ExamSchedulePage() {
  const ctx = await requirePermission("assessments.schedule.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Exam Schedule" subtitle={`${model.events.length} exam events`} rows={model.events} empty="No exam events scheduled." columns={[
    { label: "Date", value: (row) => row.examDate },
    { label: "Assessment", value: (row) => model.types.find((type) => type.id === row.assessmentTypeId)?.code ?? "Type" },
    { label: "Subject", value: (row) => {
      const offering = model.offerings.find((item) => item.id === row.offeringId);
      return model.subjects.find((subject) => subject.id === offering?.subjectId)?.name ?? "Unknown";
    } },
    { label: "Section", value: (row) => model.sections.find((section) => section.id === row.sectionId)?.name ?? "Unknown" },
    { label: "Status", value: (row) => <StatusBadge status={row.marksFinalized ? "marks_entered" : row.status} /> },
  ]} />;
}

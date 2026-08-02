import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel, listEnrollmentSummary } from "@/lib/phase4/academics";
import { OperationsPage } from "../phase4-view";

export default async function ClassesPage() {
  const ctx = await requirePermission("academics.read");
  const [model, summary] = await Promise.all([listAcademicModel(ctx.tenantId), listEnrollmentSummary(ctx.tenantId)]);
  return <OperationsPage title="Classes & Sections" subtitle={`${model.classes.length} classes, ${model.sections.length} sections`} rows={model.classes} empty="No classes are configured yet." columns={[
    { label: "Class", value: (row) => row.name },
    { label: "Program", value: (row) => row.programName ?? "Grade" },
    { label: "Year", value: (row) => row.academicYear },
    { label: "Sections", value: (row) => model.sections.filter((section) => section.classId === row.id).map((section) => `${section.name}${section.capacity ? ` (${section.capacity})` : ""}`).join(", ") || "No sections" },
    { label: "Roster", value: (row) => summary.filter((item) => item.classId === row.id).reduce((total, item) => total + Number(item.total), 0) },
  ]} />;
}

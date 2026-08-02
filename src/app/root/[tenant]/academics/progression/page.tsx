import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel, listEnrollmentSummary } from "@/lib/phase4/academics";
import { OperationsPage } from "../phase4-view";

export default async function ProgressionPage() {
  const ctx = await requirePermission("academics.progression.read");
  const [model, summary] = await Promise.all([listAcademicModel(ctx.tenantId), listEnrollmentSummary(ctx.tenantId)]);
  const current = model.years.find((year) => year.isCurrent);
  return <OperationsPage title="Progression" subtitle={`Current year: ${current?.name ?? "not selected"}, rollover preview API ready`} rows={summary} empty="No active enrollments found for progression." columns={[
    { label: "Class", value: (row) => row.className },
    { label: "Section", value: (row) => row.sectionName ?? "Unassigned" },
    { label: "Enrolled", value: (row) => Number(row.total) },
    { label: "Active", value: (row) => Number(row.active) },
  ]} />;
}

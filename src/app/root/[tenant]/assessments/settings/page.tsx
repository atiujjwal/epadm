import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function AssessmentSettingsPage() {
  const ctx = await requirePermission("assessments.plans.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Assessment Settings" subtitle={`${model.scales.length} grade scales, ${model.types.length} assessment types`} rows={model.bands} empty="No grade scale bands configured." columns={[
    { label: "Grade", value: (row) => row.gradeLabel },
    { label: "Range", value: (row) => `${row.minPercent}% - ${row.maxPercent}%` },
    { label: "Point", value: (row) => row.gradePoint ?? "-" },
    { label: "Result", value: (row) => <StatusBadge status={row.isPass ? "pass" : "fail"} /> },
  ]} />;
}

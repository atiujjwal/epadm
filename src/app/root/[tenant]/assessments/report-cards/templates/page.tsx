import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel } from "@/lib/phase6/assessments";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function ReportCardTemplatesPage() {
  const ctx = await requirePermission("assessments.report-cards.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return <OperationsPage title="Report Card Templates" subtitle="JSON-configured printable report card templates" rows={model.templates} empty="No templates available." columns={[
    { label: "Template", value: (row) => row.name },
    { label: "Default", value: (row) => <StatusBadge status={row.isDefault ? "default" : "custom"} /> },
    { label: "Plan", value: (row) => row.planId ? model.plans.find((plan) => plan.id === row.planId)?.name ?? "Plan" : "Any plan" },
  ]} />;
}

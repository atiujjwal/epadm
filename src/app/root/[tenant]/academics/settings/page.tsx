import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel } from "@/lib/phase4/academics";
import { OperationsPage } from "../phase4-view";

export default async function AcademicSettingsPage() {
  const ctx = await requirePermission("academics.read");
  const model = await listAcademicModel(ctx.tenantId);
  return <OperationsPage title="Academic Settings" subtitle="Academic year context, campus defaults, and progression policy" rows={model.frameworks} empty="No curriculum frameworks have been linked to academic settings." columns={[
    { label: "Framework", value: (row) => row.name },
    { label: "Abbreviation", value: (row) => row.abbreviation ?? "Not set" },
    { label: "Status", value: (row) => row.isActive ? "Active" : "Inactive" },
  ]} />;
}

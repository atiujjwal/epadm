import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel } from "@/lib/phase9/laboratories";
import { OperationsPage } from "../../academics/phase4-view";

export default async function LabSafetyPage() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  const rows = model.labs.map((lab) => ({ lab: lab.name, inCharge: lab.inChargeName ?? "-", safety: "Safety instructions and incidents are tracked through the Phase 9 safety API.", status: lab.status }));
  return <OperationsPage title="Lab Safety" subtitle="Safety ownership and incident workflow" rows={rows} empty="No laboratories configured." columns={[
    { label: "Lab", value: (row) => row.lab },
    { label: "In-charge", value: (row) => row.inCharge },
    { label: "Safety workflow", value: (row) => row.safety },
    { label: "Status", value: (row) => row.status },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel } from "@/lib/phase9/laboratories";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LabEquipmentPage() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  const labName = new Map(model.labs.map((lab) => [lab.id, lab.name]));
  return <OperationsPage title="Lab Equipment" subtitle={`${model.equipment.length} assets`} rows={model.equipment} empty="No lab equipment tracked yet." columns={[
    { label: "Asset", value: (row) => row.assetCode },
    { label: "Name", value: (row) => row.name },
    { label: "Lab", value: (row) => labName.get(row.laboratoryId) ?? row.laboratoryId },
    { label: "Working", value: (row) => `${row.workingQuantity}/${row.quantity}` },
    { label: "Condition", value: (row) => row.condition },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel } from "@/lib/phase9/laboratories";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LabConsumablesPage() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  const labName = new Map(model.labs.map((lab) => [lab.id, lab.name]));
  return <OperationsPage title="Lab Consumables" subtitle={`${model.consumables.length} stock items`} rows={model.consumables} empty="No lab consumables tracked yet." columns={[
    { label: "Item", value: (row) => row.itemCode },
    { label: "Name", value: (row) => row.name },
    { label: "Lab", value: (row) => labName.get(row.laboratoryId) ?? row.laboratoryId },
    { label: "On hand", value: (row) => `${row.quantityOnHand} ${row.unit}` },
    { label: "Reorder", value: (row) => `${row.reorderLevel} ${row.unit}` },
    { label: "Status", value: (row) => <StatusBadge status={Number(row.quantityOnHand) <= Number(row.reorderLevel) ? "low" : row.status} /> },
  ]} />;
}

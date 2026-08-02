import { requirePermission } from "@/lib/auth/guards";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LibraryCirculationPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return <OperationsPage title="Circulation" subtitle={`${model.issues.length} issue records`} rows={model.issues} empty="No circulation records yet." columns={[
    { label: "Accession", value: (row) => row.accession },
    { label: "Title", value: (row) => row.title },
    { label: "Member", value: (row) => row.memberName },
    { label: "Due", value: (row) => String(row.dueDate) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

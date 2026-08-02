import { requirePermission } from "@/lib/auth/guards";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LibraryMembersPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return <OperationsPage title="Library Members" subtitle={`${model.members.length} registered borrowers`} rows={model.members} empty="No library members yet." columns={[
    { label: "Code", value: (row) => row.memberCode },
    { label: "Name", value: (row) => row.displayName },
    { label: "Type", value: (row) => row.memberType },
    { label: "Limit", value: (row) => row.maxActiveIssues },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

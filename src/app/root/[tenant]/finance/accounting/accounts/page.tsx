import { requirePermission } from "@/lib/auth/guards";
import { listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function AccountsPage() {
  const ctx = await requirePermission("finance.accounting.read");
  const model = await listFinanceModel(ctx.tenantId);
  return <OperationsPage title="Chart of Accounts" subtitle={`${model.accounts.length} seeded and custom accounts`} rows={model.accounts} empty="No financial accounts configured." columns={[
    { label: "Code", value: (row) => row.code },
    { label: "Name", value: (row) => row.parentId ? `— ${row.name}` : row.name },
    { label: "Type", value: (row) => row.type },
    { label: "Status", value: (row) => <StatusBadge status={row.isSystem ? "system" : "custom"} /> },
  ]} />;
}

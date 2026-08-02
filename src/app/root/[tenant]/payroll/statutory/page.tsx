import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage } from "../../academics/phase4-view";

export default async function PayrollStatutoryPage() {
  const ctx = await requirePermission("payroll.statutory.read");
  const model = await listPayrollModel(ctx.tenantId);
  const rows = ["PF_EMP", "PF_EMP_ER", "ESI_EMP", "ESI_EMP_ER", "PT", "TDS"].map((code) => ({ code, amount: model.lines.filter((line) => line.componentCode === code).reduce((sum, line) => sum + line.amountPaise, 0) }));
  return <OperationsPage title="Statutory Payroll Summary" subtitle="PF, ESI, professional tax, and TDS snapshots from computed entries" rows={rows} empty="No statutory payroll lines computed yet." columns={[
    { label: "Head", value: (row) => row.code },
    { label: "Amount", value: (row) => formatCurrency(row.amount) },
  ]} />;
}

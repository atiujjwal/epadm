import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listPayrollModel } from "@/lib/phase8/payroll";
import { OperationsPage } from "../../academics/phase4-view";

export default async function PayrollSettingsPage() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  const s = model.settings;
  const rows = s ? [
    { setting: "PF employee / employer", value: `${s.pfEmployeeRate}% / ${s.pfEmployerRate}%`, detail: s.pfEnabled ? "Enabled" : "Disabled" },
    { setting: "ESI employee / employer", value: `${s.esiEmployeeRate}% / ${s.esiEmployerRate}%`, detail: `Ceiling ${formatCurrency(s.esiGrossCeilingPaise)}` },
    { setting: "Professional tax", value: formatCurrency(s.ptMonthlyPaise), detail: `Threshold ${formatCurrency(s.ptThresholdPaise)}` },
    { setting: "Payroll calendar", value: `${s.standardWorkingDays} working days`, detail: `Pay day ${s.payDay}` },
  ] : [];
  return <OperationsPage title="Payroll Settings" subtitle="Tenant statutory defaults and calendar settings" rows={rows} empty="Payroll settings have not been seeded." columns={[
    { label: "Setting", value: (row) => row.setting },
    { label: "Value", value: (row) => row.value },
    { label: "Detail", value: (row) => row.detail },
  ]} />;
}

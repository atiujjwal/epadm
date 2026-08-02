import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage } from "../../academics/phase4-view";

export default async function LibrarySettingsPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  const rows = [
    { setting: "Default loan days", value: String(model.settings.defaultLoanDays) },
    { setting: "Max renewals", value: String(model.settings.maxRenewals) },
    { setting: "Fine per day", value: formatCurrency(model.settings.finePerDayPaise) },
    { setting: "Student issue limit", value: String(model.settings.studentMaxIssues) },
    { setting: "Staff issue limit", value: String(model.settings.staffMaxIssues) },
  ];
  return <OperationsPage title="Library Settings" subtitle="Borrowing limits and fine policy" rows={rows} empty="No settings." columns={[
    { label: "Setting", value: (row) => row.setting },
    { label: "Value", value: (row) => row.value },
  ]} />;
}

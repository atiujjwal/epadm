import { requirePermission } from "@/lib/auth/guards";
import { calculateLibraryFine, listLibraryModel } from "@/lib/phase9/library";
import { formatCurrency } from "@/lib/phase7/finance";
import { OperationsPage } from "../../academics/phase4-view";

export default async function LibraryOverduePage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  const today = new Date().toISOString().slice(0, 10);
  const rows = model.issues.filter((issue) => !issue.returnedAt && String(issue.dueDate) < today).map((issue) => ({ ...issue, computedFine: calculateLibraryFine({ dueDate: issue.dueDate, finePerDayPaise: model.settings.finePerDayPaise }).finePaise }));
  return <OperationsPage title="Overdue Books" subtitle={`${rows.length} overdue issues`} rows={rows} empty="No overdue issues." columns={[
    { label: "Accession", value: (row) => row.accession },
    { label: "Title", value: (row) => row.title },
    { label: "Member", value: (row) => row.memberName },
    { label: "Due", value: (row) => String(row.dueDate) },
    { label: "Fine", value: (row) => formatCurrency(row.computedFine) },
  ]} />;
}

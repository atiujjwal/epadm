import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, listFinanceModel } from "@/lib/phase7/finance";
import { OperationsPage } from "../../../academics/phase4-view";

export default async function FeeAssignmentsPage() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return <OperationsPage title="Student Fee Assignments" subtitle={`${model.assignments.length} student-year assignments`} rows={model.assignments} empty="No student fee assignments yet." columns={[
    { label: "Student", value: (row) => `${row.studentName} · ${row.admissionNumber}` },
    { label: "Net amount", value: (row) => formatCurrency(row.netAmountPaise) },
    { label: "Concession", value: (row) => formatCurrency(row.concessionAmountPaise) },
    { label: "Created", value: (row) => row.createdAt.toLocaleDateString("en-IN") },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, getStudentFeesSummary } from "@/lib/phase7/finance";
import { OperationsPage, RouteButton, StatusBadge } from "../../../academics/phase4-view";

type Props = { params: Promise<{ studentId: string }> };

export default async function StudentFeesPage({ params }: Props) {
  const ctx = await requirePermission("finance.fees.read");
  const { studentId } = await params;
  const data = await getStudentFeesSummary(ctx.tenantId, studentId);
  const rows = data.invoices.map((invoice) => ({
    invoice: invoice.invoiceNumber ?? invoice.title,
    period: invoice.periodLabel ?? invoice.title,
    total: invoice.totalPaise ?? invoice.amount * 100,
    paid: invoice.paidPaise,
    balance: invoice.balancePaise ?? 0,
    due: invoice.dueDate,
    status: invoice.status,
  }));
  return <OperationsPage title="Student Fees" subtitle={`Total ${formatCurrency(data.summary.totalPaise)} · paid ${formatCurrency(data.summary.paidPaise)} · outstanding ${formatCurrency(data.summary.outstandingPaise)}`} actions={<RouteButton href="/finance/fees/payments/new">Record payment</RouteButton>} rows={rows} empty="No fee invoices for this student yet." columns={[
    { label: "Invoice", value: (row) => row.invoice },
    { label: "Period", value: (row) => row.period },
    { label: "Total", value: (row) => formatCurrency(row.total) },
    { label: "Paid", value: (row) => formatCurrency(row.paid) },
    { label: "Balance", value: (row) => formatCurrency(row.balance) },
    { label: "Due", value: (row) => String(row.due) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

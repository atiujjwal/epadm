import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency, getInvoiceDetail } from "@/lib/phase7/finance";
import { OperationsPage, RouteButton, StatusBadge } from "../../../../academics/phase4-view";

type Props = { params: Promise<{ invoiceId: string }> };

export default async function InvoiceDetailPage({ params }: Props) {
  const ctx = await requirePermission("finance.fees.read");
  const { invoiceId } = await params;
  const detail = await getInvoiceDetail(ctx.tenantId, invoiceId);
  if (!detail) notFound();
  const rows = [
    { label: "Subtotal", value: formatCurrency(detail.invoice.subtotalPaise ?? 0), status: "amount" },
    { label: "Concession", value: formatCurrency(detail.invoice.concessionPaise), status: "discount" },
    { label: "Late fee", value: formatCurrency(detail.invoice.lateFeePaise), status: "late" },
    { label: "Total", value: formatCurrency(detail.invoice.totalPaise ?? 0), status: "total" },
    { label: "Paid", value: formatCurrency(detail.invoice.paidPaise), status: "paid" },
    { label: "Balance", value: formatCurrency(detail.invoice.balancePaise ?? 0), status: detail.invoice.status },
  ];
  return <OperationsPage title={detail.invoice.invoiceNumber ?? detail.invoice.title} subtitle={`${detail.invoice.studentName} · due ${detail.invoice.dueDate}`} actions={<RouteButton href="/finance/fees/payments/new">Record payment</RouteButton>} rows={rows} empty="No invoice summary available." columns={[
    { label: "Field", value: (row) => row.label },
    { label: "Amount", value: (row) => row.value },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

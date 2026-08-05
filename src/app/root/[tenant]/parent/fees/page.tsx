import { requireRole } from "@/lib/auth/guards";
import { getParentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, StatGrid, Status, formatINR } from "../../phase11-view";

export default async function ParentFeesPage() {
  const ctx = await requireRole(["parent"]);
  const model = await getParentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="Fees" description="Student billing and receipts."><EmptyPortal message="No linked child fee records." /></PortalShell>;
  return <PortalShell title="Fees" description="Invoices and outstanding balance."><StatGrid stats={[{ label: "Outstanding", value: formatINR(model.data.outstandingPaise) }, { label: "Invoices", value: model.data.invoices.length }]} /><SimpleTable rows={model.data.invoices} columns={[{ label: "Invoice", value: (row) => row.invoiceNumber ?? row.title }, { label: "Due", value: (row) => row.dueDate }, { label: "Total", value: (row) => formatINR(row.totalPaise ?? row.amount * 100) }, { label: "Paid", value: (row) => formatINR(row.paidPaise) }, { label: "Balance", value: (row) => formatINR(row.balancePaise ?? 0) }, { label: "Status", value: (row) => <Status value={row.status} /> }]} /></PortalShell>;
}

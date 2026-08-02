import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase7/finance";
import { listTransportModel } from "@/lib/phase9/transport";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function TransportAllocationsPage() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  const routeName = new Map(model.routes.map((route) => [route.id, route.name]));
  return <OperationsPage title="Transport Allocations" subtitle={`${model.allocations.length} student allocations`} rows={model.allocations} empty="No student transport allocations yet." columns={[
    { label: "Student", value: (row) => `${row.studentName} (${row.admissionNumber})` },
    { label: "Route", value: (row) => routeName.get(row.routeId) ?? row.routeId },
    { label: "From", value: (row) => String(row.startDate) },
    { label: "Monthly fee", value: (row) => formatCurrency(row.monthlyFeePaise) },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

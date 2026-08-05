import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel } from "@/lib/phase10/facilities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function VisitorsPage() {
  const ctx = await requirePermission("facilities.visitors.manage");
  const model = await listFacilitiesModel(ctx.tenantId);
  return <OperationsPage title="Visitors" subtitle="Visitor sign-in/out register" rows={model.visitors} empty="No visitor records yet." columns={[
    { label: "Pass", value: (row) => row.passNumber },
    { label: "Visitor", value: (row) => row.visitorName },
    { label: "Phone", value: (row) => row.phone },
    { label: "Whom to meet", value: (row) => row.whomToMeet },
    { label: "In", value: (row) => row.checkIn.toLocaleString() },
    { label: "Out", value: (row) => row.checkOut?.toLocaleString() ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.checkOut ? "signed_out" : "active"} /> },
  ]} />;
}

import { requirePermission } from "@/lib/auth/guards";
import { listHostelModel } from "@/lib/phase10/hostel";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function HostelLeavePassesPage() {
  const ctx = await requirePermission("hostel.leave.manage");
  const model = await listHostelModel(ctx.tenantId);
  return <OperationsPage title="Hostel Leave Passes" subtitle="Temporary leave, approval, and returns" rows={model.leavePasses} empty="No leave passes yet." columns={[
    { label: "Student", value: (row) => row.studentId },
    { label: "From", value: (row) => row.leaveFrom.toLocaleString() },
    { label: "To", value: (row) => row.leaveTo.toLocaleString() },
    { label: "Destination", value: (row) => row.destination },
    { label: "Reason", value: (row) => row.reason },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}

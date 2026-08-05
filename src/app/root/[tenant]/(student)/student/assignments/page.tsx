import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, Status } from "../../../phase11-view";

export default async function StudentAssignmentsPage() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="My assignments" description="Class assignments and submissions."><EmptyPortal message="No student profile linked." /></PortalShell>;
  return <PortalShell title="My assignments" description="Class assignments and submissions."><SimpleTable rows={model.data.assignments} columns={[{ label: "Title", value: (row) => row.title }, { label: "Due", value: (row) => row.dueDate }, { label: "Status", value: (row) => <Status value={row.submission?.status ?? "pending"} /> }, { label: "Submitted", value: (row) => row.submission?.submittedAt?.toLocaleString() ?? "-" }, { label: "Score", value: (row) => row.submission?.score ?? "-" }]} /></PortalShell>;
}

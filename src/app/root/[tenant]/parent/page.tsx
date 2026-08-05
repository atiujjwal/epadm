import { requireRole } from "@/lib/auth/guards";
import { getParentPortalModel } from "@/lib/phase11/portal";
import { ChildSwitcher, EmptyPortal, PortalShell, SimpleTable, StatGrid, Status, formatINR } from "../phase11-view";

export default async function ParentPortalPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const ctx = await requireRole(["parent"]);
  const { studentId } = await searchParams;
  const model = await getParentPortalModel(ctx.tenantId, ctx.userId, studentId);
  if (!model.selected || !model.data) {
    return <PortalShell title="Parent portal" description="Follow linked children across school life."><EmptyPortal message="No children linked yet. Ask the school administrator to enable guardian portal access." /></PortalShell>;
  }
  return (
    <PortalShell title="Parent portal" description={`Viewing ${model.selected.firstName} ${model.selected.lastName ?? ""}`}>
      <ChildSwitcher students={model.linkedStudents} selectedId={model.selected.studentId} />
      <StatGrid stats={[
        { label: "Attendance", value: model.data.attendancePercent == null ? "-" : `${model.data.attendancePercent}%` },
        { label: "Outstanding fees", value: formatINR(model.data.outstandingPaise) },
        { label: "Pending leaves", value: model.data.leaves.filter((leave) => leave.status === "pending").length },
        { label: "Unread notices", value: model.announcements.filter((row) => !row.readAt).length },
      ]} />
      <SimpleTable rows={model.announcements} empty="No announcements for this child." columns={[
        { label: "Notice", value: (row) => row.title },
        { label: "Priority", value: (row) => <Status value={row.priority} /> },
        { label: "Published", value: (row) => row.publishedAt?.toLocaleString() ?? "-" },
        { label: "Read", value: (row) => <Status value={row.readAt ? "yes" : "no"} /> },
      ]} />
    </PortalShell>
  );
}

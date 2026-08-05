import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function AnnouncementsPage() {
  const ctx = await requirePermission("communications.read");
  const model = await listCommunicationsModel(ctx.tenantId);
  return <PortalShell title="Announcements" description="Published and draft notices."><SimpleTable rows={model.announcements} columns={[{ label: "Title", value: (row) => row.title }, { label: "Priority", value: (row) => <Status value={row.priority} /> }, { label: "Target", value: (row) => row.targetRole ?? row.targetSectionId ?? "Whole school" }, { label: "Published", value: (row) => row.publishedAt?.toLocaleString() ?? "Draft" }]} /></PortalShell>;
}

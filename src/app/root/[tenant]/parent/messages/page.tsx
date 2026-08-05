import { requireRole } from "@/lib/auth/guards";
import { listParentMessagesForUser } from "@/lib/phase11/portal";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function ParentMessagesPage() {
  const ctx = await requireRole(["parent"]);
  const messages = await listParentMessagesForUser(ctx.tenantId, ctx.userId);
  return <PortalShell title="Messages" description="Parent-school communication threads."><SimpleTable rows={messages} columns={[{ label: "Subject", value: (row) => row.subject }, { label: "Direction", value: (row) => <Status value={row.direction} /> }, { label: "Created", value: (row) => row.createdAt.toLocaleString() }, { label: "Message", value: (row) => row.body }]} /></PortalShell>;
}

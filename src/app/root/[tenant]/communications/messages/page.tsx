import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function AdminParentMessagesPage() {
  const ctx = await requirePermission("communications.messages.manage");
  const model = await listCommunicationsModel(ctx.tenantId);
  return <PortalShell title="Parent messages" description="Messages from guardians and school replies."><SimpleTable rows={model.messages} columns={[{ label: "Student", value: (row) => `${row.studentName} (${row.admissionNumber})` }, { label: "Guardian", value: (row) => row.guardianName }, { label: "Subject", value: (row) => row.subject }, { label: "Direction", value: (row) => <Status value={row.direction} /> }, { label: "Created", value: (row) => row.createdAt.toLocaleString() }]} /></PortalShell>;
}

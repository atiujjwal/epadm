import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function QueuePage() {
  const ctx = await requirePermission("communications.queue.manage");
  const model = await listCommunicationsModel(ctx.tenantId);
  return <PortalShell title="Notification queue" description="Best-effort delivery tracking."><SimpleTable rows={model.queue} columns={[{ label: "Channel", value: (row) => <Status value={row.channel} /> }, { label: "Recipient", value: (row) => row.recipientEmail ?? row.recipientPhone ?? row.recipientUserId ?? "-" }, { label: "Event", value: (row) => row.eventType ?? "-" }, { label: "Status", value: (row) => <Status value={row.status} /> }, { label: "Attempts", value: (row) => row.attempts }, { label: "Error", value: (row) => row.errorMessage ?? "-" }]} /></PortalShell>;
}

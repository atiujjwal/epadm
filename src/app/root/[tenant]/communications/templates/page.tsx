import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function TemplatesPage() {
  const ctx = await requirePermission("communications.read");
  const model = await listCommunicationsModel(ctx.tenantId);
  return <PortalShell title="Notification templates" description="Seeded and tenant-specific message templates."><SimpleTable rows={model.templates} columns={[{ label: "Name", value: (row) => row.name }, { label: "Event", value: (row) => row.eventType ?? "manual" }, { label: "Channel", value: (row) => <Status value={row.channel} /> }, { label: "Active", value: (row) => <Status value={row.isActive ? "active" : "disabled"} /> }]} /></PortalShell>;
}

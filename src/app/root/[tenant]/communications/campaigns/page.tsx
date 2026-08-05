import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function CampaignsPage() {
  const ctx = await requirePermission("communications.read");
  const model = await listCommunicationsModel(ctx.tenantId);
  return <PortalShell title="Campaigns" description="Multi-channel campaign tracking."><SimpleTable rows={model.campaigns} columns={[{ label: "Name", value: (row) => row.name }, { label: "Channel", value: (row) => row.channel }, { label: "Audience", value: (row) => row.audience }, { label: "Recipients", value: (row) => row.recipientCount }, { label: "Delivered", value: (row) => row.deliveredCount }, { label: "Status", value: (row) => <Status value={row.status} /> }]} /></PortalShell>;
}

import { listCampaigns } from "@/lib/admin/communications";
import { getCtx } from "@/lib/context";
import { CommunicationsWorkspace } from "./communications-workspace";

export default async function CommunicationsPage() {
  const ctx = await getCtx();
  const campaigns = await listCampaigns(ctx.tenantId);

  return <CommunicationsWorkspace initialCampaigns={campaigns} />;
}

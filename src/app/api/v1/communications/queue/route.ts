import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";

export async function GET() {
  const ctx = await requirePermission("communications.queue.manage");
  const model = await listCommunicationsModel(ctx.tenantId);
  return Response.json({ queue: model.queue });
}

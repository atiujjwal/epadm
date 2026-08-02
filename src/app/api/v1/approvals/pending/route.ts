import { requirePermission } from "@/lib/auth/guards";
import { getPendingApprovals } from "@/lib/phase8/hr";

export async function GET() {
  const ctx = await requirePermission("approvals.read");
  return Response.json(await getPendingApprovals(ctx.tenantId, ctx.userId));
}

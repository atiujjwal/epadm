import { requirePermission } from "@/lib/auth/guards";
import { runRetentionJob } from "@/lib/governance/retention";

export async function POST() {
  const ctx = await requirePermission("administration.privacy.manage");
  return Response.json(await runRetentionJob(ctx.tenantId, ctx.userId));
}

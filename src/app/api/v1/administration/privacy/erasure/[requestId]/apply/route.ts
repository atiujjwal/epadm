import { requirePermission } from "@/lib/auth/guards";
import { applyStudentErasure } from "@/lib/governance/retention";

export async function POST(_request: Request, context: { params: Promise<{ requestId: string }> }) {
  const ctx = await requirePermission("administration.privacy.manage");
  const { requestId } = await context.params;
  return Response.json({ request: await applyStudentErasure(ctx.tenantId, ctx.userId, requestId) });
}

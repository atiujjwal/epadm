import { requirePermission } from "@/lib/auth/guards";
import { phase6ApiError, publishResults } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ planId: string; sectionId: string }> };

export async function POST(_request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.results.publish");
  const { planId, sectionId } = await params;
  try { return Response.json(await publishResults(ctx.tenantId, ctx.userId, planId, sectionId)); } catch (error) { return phase6ApiError(error); }
}

import { requirePermission } from "@/lib/auth/guards";
import { activateAssessmentPlan, phase6ApiError } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.plans.write");
  const { id } = await params;
  try { return Response.json({ plan: await activateAssessmentPlan(ctx.tenantId, id) }); } catch (error) { return phase6ApiError(error); }
}

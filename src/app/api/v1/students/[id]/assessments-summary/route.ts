import { requirePermission } from "@/lib/auth/guards";
import { getStudentAssessmentSummary } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.results.read");
  const { id } = await params;
  return Response.json(await getStudentAssessmentSummary(ctx.tenantId, id));
}

import { requirePermission } from "@/lib/auth/guards";
import { listSectionResults } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ planId: string; sectionId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.results.read");
  const { planId, sectionId } = await params;
  return Response.json({ results: await listSectionResults(ctx.tenantId, planId, sectionId) });
}

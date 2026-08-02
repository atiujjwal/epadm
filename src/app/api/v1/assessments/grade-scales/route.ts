import { requirePermission } from "@/lib/auth/guards";
import { ensureAssessmentDefaults, listAssessmentModel } from "@/lib/phase6/assessments";

export async function GET() {
  const ctx = await requirePermission("assessments.plans.read");
  await ensureAssessmentDefaults(ctx.tenantId);
  const model = await listAssessmentModel(ctx.tenantId);
  return Response.json({ scales: model.scales, bands: model.bands });
}

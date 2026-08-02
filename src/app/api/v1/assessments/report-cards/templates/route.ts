import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listAssessmentModel, phase6ApiError, upsertReportCardTemplate } from "@/lib/phase6/assessments";

const schema = z.object({ id: z.string().uuid().optional(), name: z.string().min(1), planId: z.string().uuid().nullable().optional(), isDefault: z.boolean().optional(), config: z.record(z.string(), z.unknown()).optional() });

export async function GET() {
  const ctx = await requirePermission("assessments.report-cards.read");
  return Response.json({ templates: (await listAssessmentModel(ctx.tenantId)).templates });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("assessments.report-cards.manage");
  try { return Response.json({ template: await upsertReportCardTemplate(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase6ApiError(error); }
}

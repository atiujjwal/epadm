import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createAssessmentPlan, listAssessmentModel, phase6ApiError } from "@/lib/phase6/assessments";

const componentSchema = z.object({ assessmentTypeId: z.string().uuid(), weightPercent: z.string(), maxMarks: z.string(), isGradebookSource: z.boolean().optional(), displayOrder: z.number().int().optional() });
const schema = z.object({ academicYearId: z.string().uuid(), termId: z.string().uuid().nullable().optional(), name: z.string().min(1), appliesToClass: z.string().uuid().nullable().optional(), maxMarks: z.string().optional(), components: z.array(componentSchema).optional() });

export async function GET() {
  const ctx = await requirePermission("assessments.plans.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return Response.json({ plans: model.plans, components: model.components, types: model.types });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("assessments.plans.write");
  try { return Response.json({ plan: await createAssessmentPlan(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase6ApiError(error); }
}

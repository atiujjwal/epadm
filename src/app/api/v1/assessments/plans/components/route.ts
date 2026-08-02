import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase6ApiError, upsertPlanComponent } from "@/lib/phase6/assessments";

const schema = z.object({ planId: z.string().uuid(), assessmentTypeId: z.string().uuid(), weightPercent: z.string(), maxMarks: z.string(), isGradebookSource: z.boolean().optional(), displayOrder: z.number().int().optional() });

export async function POST(request: Request) {
  const ctx = await requirePermission("assessments.plans.write");
  try { return Response.json({ component: await upsertPlanComponent(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase6ApiError(error); }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { computePlanResults, phase6ApiError } from "@/lib/phase6/assessments";

const schema = z.object({ planId: z.string().uuid(), sectionId: z.string().uuid() });

export async function POST(request: Request) {
  const ctx = await requirePermission("assessments.results.compute");
  try {
    const input = schema.parse(await request.json());
    return Response.json(await computePlanResults(ctx.tenantId, input.planId, input.sectionId));
  } catch (error) { return phase6ApiError(error); }
}

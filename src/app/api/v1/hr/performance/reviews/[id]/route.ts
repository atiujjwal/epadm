import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { acknowledgePerformanceReview, submitReviewerAssessment, submitSelfAssessment } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ staffId: z.string().uuid().optional(), selfAssessment: z.record(z.string(), z.unknown()).optional(), reviewerComments: z.string().nullable().optional(), dimensionRatings: z.record(z.string(), z.number()).optional(), overallRating: z.string().or(z.number()).nullable().optional(), acknowledge: z.boolean().optional() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.performance.write");
  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    if (body.acknowledge) return Response.json({ review: await acknowledgePerformanceReview(ctx.tenantId, body.staffId ?? ctx.userId, id) });
    if (body.selfAssessment) return Response.json({ review: await submitSelfAssessment(ctx.tenantId, body.staffId ?? ctx.userId, id, body.selfAssessment) });
    return Response.json({ review: await submitReviewerAssessment(ctx.tenantId, ctx.userId, id, body) });
  } catch (error) {
    return phase8ApiError(error);
  }
}

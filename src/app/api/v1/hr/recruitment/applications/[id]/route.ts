import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase8ApiError } from "@/lib/phase8/payroll";
import { createRecruitmentOffer, scheduleRecruitmentInterview, updateRecruitmentApplicationStage } from "@/lib/phase8/hr";

const schema = z.object({
  stage: z.string().optional(),
  interview: z.object({ scheduledAt: z.string(), interviewerUserId: z.string().uuid().nullable().optional() }).optional(),
  offer: z.object({ offeredRole: z.string(), offeredCtcPaise: z.number().int().positive(), joiningDate: z.string().nullable().optional(), documentUrl: z.string().nullable().optional() }).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.recruitment.write");
  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    if (body.interview) return Response.json({ interview: await scheduleRecruitmentInterview(ctx.tenantId, { applicationId: id, ...body.interview }) });
    if (body.offer) return Response.json({ offer: await createRecruitmentOffer(ctx.tenantId, ctx.userId, { applicationId: id, ...body.offer }) });
    return Response.json({ application: await updateRecruitmentApplicationStage(ctx.tenantId, id, body.stage ?? "screening") });
  } catch (error) {
    return phase8ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { finalizeExamMarks, phase6ApiError } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ eventId: string }> };

export async function POST(_request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.marks.finalize");
  const { eventId } = await params;
  try { return Response.json({ event: await finalizeExamMarks(ctx.tenantId, ctx.userId, eventId) }); } catch (error) { return phase6ApiError(error); }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listMarksForEvent, phase6ApiError, saveExamMarks } from "@/lib/phase6/assessments";

type Context = { params: Promise<{ eventId: string }> };
const rowSchema = z.object({ studentId: z.string().uuid(), marksObtained: z.string().nullable().optional(), isAbsent: z.boolean().optional(), isExempt: z.boolean().optional(), remarks: z.string().nullable().optional() });
const schema = z.object({ marks: z.array(rowSchema) });

export async function GET(_request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.marks.read");
  const { eventId } = await params;
  return Response.json({ marks: await listMarksForEvent(ctx.tenantId, eventId) });
}

export async function PATCH(request: Request, { params }: Context) {
  const ctx = await requirePermission("assessments.marks.write");
  const { eventId } = await params;
  try { return Response.json(await saveExamMarks(ctx.tenantId, ctx.userId, eventId, schema.parse(await request.json()).marks)); } catch (error) { return phase6ApiError(error); }
}

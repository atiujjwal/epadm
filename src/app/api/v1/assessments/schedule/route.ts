import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createExamEvent, listAssessmentModel, phase6ApiError } from "@/lib/phase6/assessments";

const schema = z.object({ academicYearId: z.string().uuid(), planId: z.string().uuid(), assessmentTypeId: z.string().uuid(), offeringId: z.string().uuid(), sectionId: z.string().uuid(), examDate: z.string(), startTime: z.string().nullable().optional(), durationMinutes: z.number().int().nullable().optional(), roomId: z.string().uuid().nullable().optional(), invigilatorId: z.string().uuid().nullable().optional(), maxMarks: z.string(), passingMarks: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("assessments.schedule.read");
  const model = await listAssessmentModel(ctx.tenantId);
  return Response.json({ events: model.events, plans: model.plans, types: model.types, offerings: model.offerings, sections: model.sections });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("assessments.schedule.write");
  try { return Response.json(await createExamEvent(ctx.tenantId, ctx.userId, schema.parse(await request.json())), { status: 201 }); } catch (error) { return phase6ApiError(error); }
}

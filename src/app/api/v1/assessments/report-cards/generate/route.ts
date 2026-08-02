import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { generateReportCards, phase6ApiError } from "@/lib/phase6/assessments";

const schema = z.object({ planId: z.string().uuid(), sectionId: z.string().uuid(), studentIds: z.array(z.string().uuid()), templateId: z.string().uuid().nullable().optional() });

export async function POST(request: Request) {
  const ctx = await requirePermission("assessments.report-cards.generate");
  try { return Response.json(await generateReportCards(ctx.tenantId, ctx.userId, schema.parse(await request.json()))); } catch (error) { return phase6ApiError(error); }
}

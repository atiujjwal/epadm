import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createOffering, listCurriculum, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ academicYearId: z.string().uuid(), classId: z.string().uuid(), subjectId: z.string().uuid(), isCore: z.boolean().optional(), periodsPerWeek: z.number().int().min(1).optional() });

export async function GET(request: Request) {
  const ctx = await requirePermission("curriculum.read");
  return Response.json({ curriculum: await listCurriculum(ctx.tenantId, new URL(request.url).searchParams.get("yearId") ?? undefined) });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("curriculum.write");
  try { return Response.json({ offering: await createOffering(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

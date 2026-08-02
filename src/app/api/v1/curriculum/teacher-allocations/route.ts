import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createTeacherAllocation, listCurriculum, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ offeringId: z.string().uuid(), sectionId: z.string().uuid(), staffId: z.string().uuid(), isPrimary: z.boolean().optional() });

export async function GET() {
  const ctx = await requirePermission("curriculum.read");
  return Response.json({ allocations: (await listCurriculum(ctx.tenantId)).allocations });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("curriculum.write");
  try { return Response.json({ allocation: await createTeacherAllocation(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

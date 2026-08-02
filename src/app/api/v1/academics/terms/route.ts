import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createTerm, listAcademicModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ academicYearId: z.string().uuid(), name: z.string().min(1), startDate: z.string(), endDate: z.string(), displayOrder: z.number().int().optional() });

export async function GET() {
  const ctx = await requirePermission("academics.read");
  return Response.json({ terms: (await listAcademicModel(ctx.tenantId)).terms });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.write");
  try { return Response.json({ term: await createTerm(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

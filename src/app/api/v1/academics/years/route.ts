import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createYear, listAcademicModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(2), startDate: z.string(), endDate: z.string(), status: z.enum(["draft", "active", "archived"]).optional(), isCurrent: z.boolean().optional(), campusId: z.string().uuid().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("academics.read");
  return Response.json({ years: (await listAcademicModel(ctx.tenantId)).years });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.write");
  try { return Response.json({ year: await createYear(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

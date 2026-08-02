import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createHouse, listAcademicModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(1), color: z.string().nullable().optional(), motto: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("academics.read");
  return Response.json({ houses: (await listAcademicModel(ctx.tenantId)).houses });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.write");
  try { return Response.json({ house: await createHouse(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createFramework, listCurriculum, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(1), abbreviation: z.string().nullable().optional(), description: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("curriculum.read");
  return Response.json({ frameworks: (await listCurriculum(ctx.tenantId)).frameworks });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("curriculum.write");
  try { return Response.json({ framework: await createFramework(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

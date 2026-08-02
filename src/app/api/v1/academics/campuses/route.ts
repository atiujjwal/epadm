import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createCampus, listAcademicModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(1), shortCode: z.string().nullable().optional(), address: z.string().nullable().optional(), city: z.string().nullable().optional(), phone: z.string().nullable().optional(), email: z.string().email().nullable().optional(), isMain: z.boolean().optional(), displayOrder: z.number().int().optional() });

export async function GET() {
  const ctx = await requirePermission("academics.read");
  return Response.json({ campuses: (await listAcademicModel(ctx.tenantId)).campuses });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.write");
  try { return Response.json({ campus: await createCampus(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

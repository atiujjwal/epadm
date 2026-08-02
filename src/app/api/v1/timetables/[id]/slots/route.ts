import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createSlot, listTimetableModel, phase4ApiError } from "@/lib/phase4/academics";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ sectionId: z.string().uuid(), offeringId: z.string().uuid(), staffId: z.string().uuid(), roomId: z.string().uuid().nullable().optional(), periodId: z.string().uuid(), dayOfWeek: z.number().int().min(0).max(6) });

export async function GET(_request: Request, { params }: Context) {
  const ctx = await requirePermission("timetables.read");
  const { id } = await params;
  return Response.json({ slots: (await listTimetableModel(ctx.tenantId, id)).slots });
}

export async function POST(request: Request, { params }: Context) {
  const ctx = await requirePermission("timetables.edit");
  const { id } = await params;
  try { return Response.json({ slot: await createSlot(ctx.tenantId, id, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

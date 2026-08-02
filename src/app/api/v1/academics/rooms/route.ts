import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createRoom, listAcademicModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(1), campusId: z.string().uuid().nullable().optional(), roomType: z.enum(["classroom", "lab", "hall", "gym", "library", "office", "other"]).optional(), capacity: z.number().int().nullable().optional(), floor: z.string().nullable().optional(), building: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("academics.read");
  return Response.json({ rooms: (await listAcademicModel(ctx.tenantId)).rooms });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.write");
  try { return Response.json({ room: await createRoom(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createPeriod, listTimetableModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(1), startTime: z.string(), endTime: z.string(), isBreak: z.boolean().optional(), displayOrder: z.number().int().optional() });

export async function GET() {
  const ctx = await requirePermission("timetables.read");
  return Response.json({ periods: (await listTimetableModel(ctx.tenantId)).periods, workingDays: [1, 2, 3, 4, 5] });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("timetables.settings.update");
  try { return Response.json({ period: await createPeriod(ctx.tenantId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

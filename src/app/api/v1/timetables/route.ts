import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createTimetableVersion, listTimetableModel, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ name: z.string().min(1), academicYearId: z.string().uuid() });

export async function GET(request: Request) {
  const ctx = await requirePermission("timetables.read");
  return Response.json({ timetables: await listTimetableModel(ctx.tenantId, new URL(request.url).searchParams.get("versionId") ?? undefined) });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("timetables.edit");
  try { return Response.json({ version: await createTimetableVersion(ctx.tenantId, ctx.userId, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase4ApiError(error); }
}

import { requirePermission } from "@/lib/auth/guards";
import { listTimetableModel } from "@/lib/phase4/academics";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const ctx = await requirePermission("timetables.read");
  const { id } = await params;
  return Response.json({ timetable: await listTimetableModel(ctx.tenantId, id) });
}

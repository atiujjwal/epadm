import { requirePermission } from "@/lib/auth/guards";
import { phase4ApiError, publishVersion } from "@/lib/phase4/academics";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  const ctx = await requirePermission("timetables.edit");
  const { id } = await params;
  try { return Response.json({ version: await publishVersion(ctx.tenantId, ctx.userId, id) }); } catch (error) { return phase4ApiError(error); }
}

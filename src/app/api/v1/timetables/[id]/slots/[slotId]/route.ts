import { requirePermission } from "@/lib/auth/guards";
import { deleteSlot, phase4ApiError } from "@/lib/phase4/academics";

type Context = { params: Promise<{ id: string; slotId: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const ctx = await requirePermission("timetables.edit");
  const { id, slotId } = await params;
  try { return Response.json({ slot: await deleteSlot(ctx.tenantId, id, slotId) }); } catch (error) { return phase4ApiError(error); }
}

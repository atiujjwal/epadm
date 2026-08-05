import { requirePermission } from "@/lib/auth/guards";
import { completeWorkOrder } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function PATCH(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("facilities.work-orders.manage");
    const { id } = await params;
    const workOrder = await completeWorkOrder(ctx.tenantId, ctx.userId, id, await request.json());
    return Response.json({ workOrder });
  } catch (error) {
    return phase10ApiError(error);
  }
}

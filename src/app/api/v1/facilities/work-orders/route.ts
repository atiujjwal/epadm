import { requirePermission } from "@/lib/auth/guards";
import { createWorkOrder, listFacilitiesModel } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("facilities.work-orders.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  return Response.json({ workOrders: model.workOrders });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("facilities.work-orders.create");
    const workOrder = await createWorkOrder(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ workOrder }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

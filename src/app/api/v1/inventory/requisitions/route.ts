import { requirePermission } from "@/lib/auth/guards";
import { createPurchaseRequisition, listInventoryModel } from "@/lib/phase10/inventory";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("inventory.requisitions.read");
  const model = await listInventoryModel(ctx.tenantId);
  return Response.json({ requisitions: model.requisitions, items: model.requisitionItems });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("inventory.requisitions.write");
    const requisition = await createPurchaseRequisition(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ requisition }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { recordInventoryTransaction } from "@/lib/phase10/inventory";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("inventory.stock.manage");
    const result = await recordInventoryTransaction(ctx.tenantId, ctx.userId, await request.json());
    return Response.json(result, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

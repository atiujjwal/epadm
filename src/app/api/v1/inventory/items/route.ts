import { requirePermission } from "@/lib/auth/guards";
import { createInventoryItem, listInventoryModel } from "@/lib/phase10/inventory";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  return Response.json({ items: model.items });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("inventory.stock.manage");
    const item = await createInventoryItem(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

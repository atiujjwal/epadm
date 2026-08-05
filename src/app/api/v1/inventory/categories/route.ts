import { requirePermission } from "@/lib/auth/guards";
import { createInventoryCategory, listInventoryModel } from "@/lib/phase10/inventory";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  return Response.json({ categories: model.categories });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("inventory.stock.manage");
    const category = await createInventoryCategory(ctx.tenantId, await request.json());
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

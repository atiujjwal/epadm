import { requirePermission } from "@/lib/auth/guards";
import { createAsset, listInventoryModel } from "@/lib/phase10/inventory";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("inventory.assets.read");
  const model = await listInventoryModel(ctx.tenantId);
  return Response.json({ assets: model.assets });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("inventory.assets.manage");
    const asset = await createAsset(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ asset }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

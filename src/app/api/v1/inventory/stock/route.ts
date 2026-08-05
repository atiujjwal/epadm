import { requirePermission } from "@/lib/auth/guards";
import { listInventoryModel } from "@/lib/phase10/inventory";

export async function GET() {
  const ctx = await requirePermission("inventory.read");
  const model = await listInventoryModel(ctx.tenantId);
  return Response.json({ stock: model.stock });
}

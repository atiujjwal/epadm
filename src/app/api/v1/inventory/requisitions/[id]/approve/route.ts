import { requirePermission } from "@/lib/auth/guards";
import { approvePurchaseRequisition } from "@/lib/phase10/inventory";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function POST(_request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("inventory.requisitions.approve");
    const { id } = await params;
    return Response.json(await approvePurchaseRequisition(ctx.tenantId, ctx.userId, id));
  } catch (error) {
    return phase10ApiError(error);
  }
}

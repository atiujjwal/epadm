import { requirePermission } from "@/lib/auth/guards";
import { checkoutHostelAllocation } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function PATCH(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("hostel.allocations.manage");
    const { id } = await params;
    const allocation = await checkoutHostelAllocation(ctx.tenantId, ctx.userId, id, await request.json());
    return Response.json({ allocation });
  } catch (error) {
    return phase10ApiError(error);
  }
}

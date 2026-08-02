import { requirePermission } from "@/lib/auth/guards";
import { approveLeaveL2 } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.leave.approve");
  try {
    const { id } = await context.params;
    return Response.json({ request: await approveLeaveL2(ctx.tenantId, ctx.userId, id) });
  } catch (error) {
    return phase8ApiError(error);
  }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { rejectLeaveRequest } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ rejectionNote: z.string().min(1) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.leave.approve");
  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    return Response.json({ request: await rejectLeaveRequest(ctx.tenantId, ctx.userId, id, body.rejectionNote) });
  } catch (error) {
    return phase8ApiError(error);
  }
}

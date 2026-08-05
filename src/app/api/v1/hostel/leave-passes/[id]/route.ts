import { requirePermission } from "@/lib/auth/guards";
import { decideHostelLeavePass } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function PATCH(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("hostel.leave.manage");
    const { id } = await params;
    const leavePass = await decideHostelLeavePass(ctx.tenantId, ctx.userId, id, await request.json());
    return Response.json({ leavePass });
  } catch (error) {
    return phase10ApiError(error);
  }
}

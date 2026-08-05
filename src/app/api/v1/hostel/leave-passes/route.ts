import { requirePermission } from "@/lib/auth/guards";
import { createHostelLeavePass, listHostelModel } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("hostel.read");
  const model = await listHostelModel(ctx.tenantId);
  return Response.json({ leavePasses: model.leavePasses });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("hostel.leave.manage");
    const leavePass = await createHostelLeavePass(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ leavePass }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

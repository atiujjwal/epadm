import { requireRole } from "@/lib/auth/guards";
import { applyStudentLeaveFromParent } from "@/lib/phase11/portal";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function POST(request: Request) {
  try {
    const ctx = await requireRole(["parent"]);
    const leave = await applyStudentLeaveFromParent(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ leave }, { status: 201 });
  } catch (error) {
    return phase11ApiError(error);
  }
}

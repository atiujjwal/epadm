import { requireRole } from "@/lib/auth/guards";
import { getParentPortalModel } from "@/lib/phase11/portal";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function GET(request: Request) {
  try {
    const ctx = await requireRole(["parent"]);
    const studentId = new URL(request.url).searchParams.get("studentId");
    const model = await getParentPortalModel(ctx.tenantId, ctx.userId, studentId);
    return Response.json(model);
  } catch (error) {
    return phase11ApiError(error);
  }
}

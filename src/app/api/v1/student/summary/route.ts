import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";

export async function GET() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  return Response.json(model);
}

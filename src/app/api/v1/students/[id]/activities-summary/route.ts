import { requirePermission } from "@/lib/auth/guards";
import { getStudentActivitiesSummary } from "@/lib/phase10/activities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET(_request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("activities.read");
    const { id } = await params;
    return Response.json(await getStudentActivitiesSummary(ctx.tenantId, id));
  } catch (error) {
    return phase10ApiError(error);
  }
}

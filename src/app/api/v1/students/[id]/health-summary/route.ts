import { requirePermission } from "@/lib/auth/guards";
import { getStudentHealthSummary } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET(_request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("facilities.health.manage");
    const { id } = await params;
    const rows = await getStudentHealthSummary(ctx.tenantId, id, ["facilities.health.manage"]);
    return Response.json({ healthRecords: rows });
  } catch (error) {
    return phase10ApiError(error);
  }
}

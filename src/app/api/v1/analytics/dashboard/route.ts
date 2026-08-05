import { requirePermission } from "@/lib/auth/guards";
import { getAnalyticsDashboard, phase12ApiError } from "@/lib/phase12/analytics";

export async function GET() {
  try {
    const ctx = await requirePermission("analytics.read");
    return Response.json(await getAnalyticsDashboard(ctx.tenantId));
  } catch (error) {
    return phase12ApiError(error);
  }
}

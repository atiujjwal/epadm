import { requirePermission } from "@/lib/auth/guards";
import { computeDataQuality, phase12ApiError } from "@/lib/phase12/analytics";

export async function GET() {
  try {
    const ctx = await requirePermission("analytics.read");
    return Response.json({ issues: await computeDataQuality(ctx.tenantId) });
  } catch (error) {
    return phase12ApiError(error);
  }
}

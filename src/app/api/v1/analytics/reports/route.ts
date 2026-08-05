import { requirePermission } from "@/lib/auth/guards";
import { listReportCatalog, listReportRuns } from "@/lib/phase12/reports";
import { phase12ApiError } from "@/lib/phase12/analytics";

export async function GET() {
  try {
    const ctx = await requirePermission("analytics.read");
    const [reports, runs] = await Promise.all([Promise.resolve(listReportCatalog()), listReportRuns(ctx.tenantId)]);
    return Response.json({ reports, runs });
  } catch (error) {
    return phase12ApiError(error);
  }
}

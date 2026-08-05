import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { readReportExport } from "@/lib/phase12/reports";

export async function GET(_request: Request, context: { params: Promise<{ runId: string }> }) {
  try {
    const ctx = await requirePermission("reports.run");
    const { runId } = await context.params;
    const file = await readReportExport(ctx.tenantId, runId, "csv");
    return new Response(file, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${runId}.csv"`,
      },
    });
  } catch (error) {
    return phase12ApiError(error);
  }
}

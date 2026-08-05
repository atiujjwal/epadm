import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { getReportDefinition, runCuratedReport } from "@/lib/phase12/reports";

const schema = z.object({
  reportKey: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const definition = getReportDefinition(input.reportKey);
    const ctx = await requirePermission("reports.run");
    if (definition.requiredPermission !== "reports.run") await requirePermission(definition.requiredPermission);
    return Response.json(await runCuratedReport(ctx.tenantId, ctx.userId, input.reportKey, input.parameters ?? {}), { status: 201 });
  } catch (error) {
    return phase12ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { generatePerformanceReviews } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.performance.write");
  try {
    const { id } = await context.params;
    return Response.json(await generatePerformanceReviews(ctx.tenantId, id));
  } catch (error) {
    return phase8ApiError(error);
  }
}

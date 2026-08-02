import { requirePermission } from "@/lib/auth/guards";
import { lockPayrollRun, phase8ApiError } from "@/lib/phase8/payroll";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("payroll.runs.lock");
  try {
    const { id } = await context.params;
    return Response.json({ run: await lockPayrollRun(ctx.tenantId, ctx.userId, id) });
  } catch (error) {
    return phase8ApiError(error);
  }
}

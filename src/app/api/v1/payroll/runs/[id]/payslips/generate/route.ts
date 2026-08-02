import { requirePermission } from "@/lib/auth/guards";
import { generateRunPayslips, phase8ApiError } from "@/lib/phase8/payroll";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("payroll.payslips.generate");
  try {
    const { id } = await context.params;
    return Response.json(await generateRunPayslips(ctx.tenantId, ctx.userId, id));
  } catch (error) {
    return phase8ApiError(error);
  }
}

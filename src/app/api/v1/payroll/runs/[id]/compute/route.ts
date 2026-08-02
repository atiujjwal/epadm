import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { computePayrollRun, phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ staffId: z.string().uuid().optional(), daysAbsentByStaff: z.record(z.string(), z.number()).optional() }).optional();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("payroll.runs.compute");
  try {
    const { id } = await context.params;
    const run = await computePayrollRun(ctx.tenantId, ctx.userId, id, schema.parse(await request.json().catch(() => undefined)));
    return Response.json({ run });
  } catch (error) {
    return phase8ApiError(error);
  }
}

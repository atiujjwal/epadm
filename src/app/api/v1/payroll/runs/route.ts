import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createPayrollRun, listPayrollModel, phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ runMonth: z.number().int().min(1).max(12), runYear: z.number().int().min(2000), academicYearId: z.string().uuid().nullable().optional(), runLabel: z.string().optional() });

export async function GET() {
  const ctx = await requirePermission("payroll.runs.read");
  const model = await listPayrollModel(ctx.tenantId);
  return Response.json({ runs: model.runs, entries: model.entries });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("payroll.runs.create");
  try {
    const run = await createPayrollRun(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ run }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}

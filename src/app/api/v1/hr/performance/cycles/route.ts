import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createPerformanceCycle, listHrPhase8Model } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ name: z.string().min(1), academicYearId: z.string().uuid().nullable().optional(), reviewPeriodStart: z.string().min(1), reviewPeriodEnd: z.string().min(1) });

export async function GET() {
  const ctx = await requirePermission("hr.performance.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return Response.json({ cycles: model.cycles, reviews: model.reviews });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("hr.performance.write");
  try {
    return Response.json({ cycle: await createPerformanceCycle(ctx.tenantId, ctx.userId, schema.parse(await request.json())) }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}

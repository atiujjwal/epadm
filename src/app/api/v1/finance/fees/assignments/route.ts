import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { assignFeePlanToClass, listFinanceModel, phase7ApiError } from "@/lib/phase7/finance";

const schema = z.object({ academicYearId: z.string().uuid(), classId: z.string().uuid(), sectionId: z.string().uuid().nullable().optional(), structureId: z.string().uuid(), planId: z.string().uuid(), concessionType: z.string().nullable().optional(), concessionAmountPaise: z.coerce.number().int().min(0).optional(), concessionNote: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return Response.json({ assignments: model.assignments, structures: model.structures, plans: model.plans, years: model.years, classes: model.classes, sections: model.sections });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.fees.assign");
  try {
    const result = await assignFeePlanToClass(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json(result, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

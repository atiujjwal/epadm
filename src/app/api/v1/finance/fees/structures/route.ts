import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createFeeStructure, listFinanceModel, phase7ApiError } from "@/lib/phase7/finance";

const itemSchema = z.object({ categoryId: z.string().uuid(), label: z.string().trim().min(1), amountPaise: z.coerce.number().int().min(0), isOptional: z.boolean().optional(), displayOrder: z.number().int().optional() });
const schema = z.object({ academicYearId: z.string().uuid().nullable().optional(), classId: z.string().uuid(), name: z.string().trim().min(1), frequency: z.string().optional(), academicYear: z.string().optional(), items: z.array(itemSchema).min(1) });

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return Response.json({ structures: model.structures, items: model.items, categories: model.categories, years: model.years, classes: model.classes });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.fees.write");
  try {
    const structure = await createFeeStructure(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ structure }, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

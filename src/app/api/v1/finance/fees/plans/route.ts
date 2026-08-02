import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createFeePlan, listFinanceModel, phase7ApiError } from "@/lib/phase7/finance";

const installmentSchema = z.object({ label: z.string().trim().min(1), dueDate: z.string(), amountPaise: z.coerce.number().int().min(0), displayOrder: z.number().int().optional() });
const schema = z.object({ structureId: z.string().uuid(), name: z.string().trim().min(1), planType: z.string().optional(), lateFeePerDayPaise: z.coerce.number().int().min(0).optional(), gracePeriodDays: z.coerce.number().int().min(0).optional(), isDefault: z.boolean().optional(), installments: z.array(installmentSchema).min(1) });

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return Response.json({ plans: model.plans, installments: model.installments, structures: model.structures });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.fees.write");
  try {
    const plan = await createFeePlan(ctx.tenantId, schema.parse(await request.json()));
    return Response.json({ plan }, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

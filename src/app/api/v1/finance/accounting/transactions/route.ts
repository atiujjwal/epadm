import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase7ApiError, recordExpense } from "@/lib/phase7/finance";

const schema = z.object({ accountId: z.string().uuid(), amountPaise: z.coerce.number().int().positive(), date: z.string(), description: z.string().trim().min(1), reference: z.string().nullable().optional(), receiptPhotoUrl: z.string().nullable().optional() });

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.accounting.expenses.record");
  try {
    const transaction = await recordExpense(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ transaction }, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

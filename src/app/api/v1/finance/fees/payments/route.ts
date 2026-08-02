import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listFinanceModel, phase7ApiError, recordPayment } from "@/lib/phase7/finance";

const schema = z.object({ invoiceId: z.string().uuid(), amountPaise: z.coerce.number().int().positive(), paymentMethod: z.string(), paymentDate: z.string(), referenceNumber: z.string().nullable().optional(), bankName: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return Response.json({ payments: model.payments, receipts: model.receipts, invoices: model.invoices });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.fees.payments.record");
  try {
    const result = await recordPayment(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json(result, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

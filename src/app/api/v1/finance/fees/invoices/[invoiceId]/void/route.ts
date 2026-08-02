import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase7ApiError, voidInvoice } from "@/lib/phase7/finance";

const schema = z.object({ reason: z.string().trim().min(1) });

export async function POST(request: Request, context: { params: Promise<{ invoiceId: string }> }) {
  const ctx = await requirePermission("finance.fees.void");
  try {
    const { invoiceId } = await context.params;
    const invoice = await voidInvoice(ctx.tenantId, ctx.userId, invoiceId, schema.parse(await request.json()).reason);
    return Response.json({ invoice });
  } catch (error) {
    return phase7ApiError(error);
  }
}

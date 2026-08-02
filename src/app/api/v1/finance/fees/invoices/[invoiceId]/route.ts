import { requirePermission } from "@/lib/auth/guards";
import { getInvoiceDetail } from "@/lib/phase7/finance";

export async function GET(_request: Request, context: { params: Promise<{ invoiceId: string }> }) {
  const ctx = await requirePermission("finance.fees.read");
  const { invoiceId } = await context.params;
  const invoice = await getInvoiceDetail(ctx.tenantId, invoiceId);
  return invoice ? Response.json(invoice) : Response.json({ error: "Invoice not found" }, { status: 404 });
}

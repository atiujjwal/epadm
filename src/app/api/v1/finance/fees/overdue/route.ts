import { requirePermission } from "@/lib/auth/guards";
import { getOverdueInvoices } from "@/lib/phase7/finance";

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  return Response.json({ invoices: await getOverdueInvoices(ctx.tenantId) });
}

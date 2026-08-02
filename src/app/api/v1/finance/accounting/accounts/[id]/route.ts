import { requirePermission } from "@/lib/auth/guards";
import { deleteFinancialAccount, phase7ApiError } from "@/lib/phase7/finance";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("finance.accounting.accounts.manage");
  try {
    const { id } = await context.params;
    return Response.json({ account: await deleteFinancialAccount(ctx.tenantId, id) });
  } catch (error) {
    return phase7ApiError(error);
  }
}

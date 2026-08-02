import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createFinancialAccount, listFinanceModel, phase7ApiError } from "@/lib/phase7/finance";

const schema = z.object({ code: z.string().trim().min(1), name: z.string().trim().min(1), type: z.enum(["income", "expense"]), parentId: z.string().uuid().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("finance.accounting.read");
  const model = await listFinanceModel(ctx.tenantId);
  return Response.json({ accounts: model.accounts });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.accounting.accounts.manage");
  try {
    const account = await createFinancialAccount(ctx.tenantId, schema.parse(await request.json()));
    return Response.json({ account }, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

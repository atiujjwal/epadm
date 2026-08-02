import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { generateInvoices, listFinanceModel, phase7ApiError } from "@/lib/phase7/finance";

const schema = z.object({ academicYearId: z.string().uuid(), assignmentId: z.string().uuid().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("finance.fees.read");
  const model = await listFinanceModel(ctx.tenantId);
  return Response.json({ invoices: model.invoices, assignments: model.assignments, payments: model.payments });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("finance.fees.invoices.generate");
  try {
    const result = await generateInvoices(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json(result, { status: 201 });
  } catch (error) {
    return phase7ApiError(error);
  }
}

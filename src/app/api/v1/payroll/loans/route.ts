import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createStaffLoan, listPayrollModel, phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ staffId: z.string().uuid(), loanType: z.string().optional(), principalPaise: z.number().int().positive(), emiPaise: z.number().int().positive(), startDate: z.string().min(1), notes: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return Response.json({ loans: model.loans, staff: model.staff });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("payroll.loans.manage");
  try {
    const loan = await createStaffLoan(ctx.tenantId, schema.parse(await request.json()));
    return Response.json({ loan }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}

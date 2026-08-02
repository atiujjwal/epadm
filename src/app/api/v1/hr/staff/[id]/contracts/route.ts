import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createStaffContract, listStaffContracts } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ contractType: z.string().optional(), title: z.string().min(1), startDate: z.string().min(1), endDate: z.string().nullable().optional(), grossSalaryPaise: z.number().int().nonnegative(), basicSalaryPaise: z.number().int().nonnegative(), noticePeriodDays: z.number().int().optional(), documentUrl: z.string().nullable().optional(), status: z.string().optional(), notes: z.string().nullable().optional() });

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.contracts.read");
  const { id } = await context.params;
  return Response.json({ contracts: await listStaffContracts(ctx.tenantId, id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.contracts.write");
  try {
    const { id } = await context.params;
    const contract = await createStaffContract(ctx.tenantId, ctx.userId, { ...schema.parse(await request.json()), staffId: id });
    return Response.json({ contract }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}

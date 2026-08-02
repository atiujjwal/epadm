import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel, phase8ApiError, saveSalaryAssignments } from "@/lib/phase8/payroll";

const schema = z.object({
  staffId: z.string().uuid(),
  effectiveFrom: z.string().min(1),
  components: z.array(z.object({ code: z.string().min(1), overrideValue: z.string().or(z.number()).nullable().optional() })),
});

export async function GET() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return Response.json({ assignments: model.assignments, staff: model.staff, components: model.components });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("payroll.assignments.manage");
  try {
    const body = schema.parse(await request.json());
    const assignments = await saveSalaryAssignments(ctx.tenantId, body.staffId, body);
    return Response.json({ assignments }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}

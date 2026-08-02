import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { hireRecruitmentApplication } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ employeeCode: z.string().min(1), joinedOn: z.string().nullable().optional(), departmentId: z.string().uuid().nullable().optional(), staffType: z.string().optional(), employmentType: z.string().optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("hr.recruitment.write");
  try {
    const { id } = await context.params;
    return Response.json(await hireRecruitmentApplication(ctx.tenantId, ctx.userId, id, schema.parse(await request.json())));
  } catch (error) {
    return phase8ApiError(error);
  }
}

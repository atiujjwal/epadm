import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createStaffLeaveRequest, listHrPhase8Model } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ staffId: z.string().uuid(), leaveTypeId: z.string().uuid(), fromDate: z.string().min(1), toDate: z.string().min(1), reason: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("hr.leave.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return Response.json({ requests: model.leaveRequests, balances: model.leaveBalances, leaveTypes: model.leaveTypes });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("hr.leave.write");
  try {
    const leaveRequest = await createStaffLeaveRequest(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ request: leaveRequest }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}

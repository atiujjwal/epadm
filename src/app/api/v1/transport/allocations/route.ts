import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { assignStudentTransport, listTransportModel, phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({
  studentId: z.string().uuid(),
  routeId: z.string().uuid(),
  academicYearId: z.string().uuid().nullable().optional(),
  pickupStopId: z.string().uuid().nullable().optional(),
  dropStopId: z.string().uuid().nullable().optional(),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  monthlyFeePaise: z.coerce.number().int().min(0).optional(),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  return Response.json({ allocations: model.allocations });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("transport.allocations.manage");
  try {
    const result = await assignStudentTransport(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listTransportModel, phase9ApiError, recordVehicleMaintenance } from "@/lib/phase9/transport";

const schema = z.object({
  vehicleId: z.string().uuid(),
  maintenanceType: z.string().min(1),
  serviceDate: z.string().min(1),
  odometerKm: z.coerce.number().int().min(0).nullable().optional(),
  vendorName: z.string().nullable().optional(),
  amountPaise: z.coerce.number().int().min(0).optional(),
  nextDueDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  return Response.json({ maintenance: model.maintenance });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("transport.maintenance.manage");
  try {
    const record = await recordVehicleMaintenance(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

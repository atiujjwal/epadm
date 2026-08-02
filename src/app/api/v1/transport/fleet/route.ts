import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createTransportVehicle, listTransportModel, phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({
  code: z.string().min(1),
  numberPlate: z.string().min(1),
  driverName: z.string().nullable().optional(),
  driverPhone: z.string().nullable().optional(),
  helperName: z.string().nullable().optional(),
  helperPhone: z.string().nullable().optional(),
  routeName: z.string().nullable().optional(),
  capacity: z.coerce.number().int().min(0).optional(),
  makeModel: z.string().nullable().optional(),
  fuelType: z.string().nullable().optional(),
  gpsDeviceId: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});

export async function GET() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  return Response.json({ vehicles: model.fleet });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("transport.fleet.write");
  try {
    const vehicle = await createTransportVehicle(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ vehicle }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

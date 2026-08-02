import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listTransportModel, phase9ApiError, upsertVehicleRoute } from "@/lib/phase9/transport";

const schema = z.object({
  routeCode: z.string().min(1),
  name: z.string().min(1),
  vehicleId: z.string().uuid().nullable().optional(),
  driverName: z.string().nullable().optional(),
  helperName: z.string().nullable().optional(),
  distanceKm: z.union([z.string(), z.number()]).nullable().optional(),
  monthlyFeePaise: z.coerce.number().int().min(0).optional(),
  status: z.string().nullable().optional(),
});

export async function GET() {
  const ctx = await requirePermission("transport.read");
  const model = await listTransportModel(ctx.tenantId);
  return Response.json({ routes: model.routes, stops: model.stops });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("transport.routes.manage");
  try {
    const route = await upsertVehicleRoute(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ route }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

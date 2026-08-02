import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listTransportModel, phase9ApiError, saveRouteStops } from "@/lib/phase9/transport";

const schema = z.object({
  stops: z.array(z.object({
    stopName: z.string().min(1),
    pickupTime: z.string().nullable().optional(),
    dropTime: z.string().nullable().optional(),
    sequence: z.coerce.number().int().positive().optional(),
    latitude: z.union([z.string(), z.number()]).nullable().optional(),
    longitude: z.union([z.string(), z.number()]).nullable().optional(),
    feeOverridePaise: z.coerce.number().int().min(0).nullable().optional(),
  })),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("transport.read");
  const { id } = await params;
  const model = await listTransportModel(ctx.tenantId);
  return Response.json({ stops: model.stops.filter((stop) => stop.routeId === id) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("transport.routes.manage");
  const { id } = await params;
  try {
    const input = schema.parse(await request.json());
    const stops = await saveRouteStops(ctx.tenantId, ctx.userId, id, input.stops);
    return Response.json({ stops });
  } catch (error) {
    return phase9ApiError(error);
  }
}

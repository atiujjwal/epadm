import { z } from "zod";
import { ingestGpsEvent, phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({
  tenantId: z.string().uuid().optional(),
  vehicleId: z.string().optional(),
  externalVehicleId: z.string().optional(),
  latitude: z.union([z.string(), z.number()]),
  longitude: z.union([z.string(), z.number()]),
  speed: z.union([z.string(), z.number()]).nullable().optional(),
  heading: z.union([z.string(), z.number()]).nullable().optional(),
  ignitionOn: z.boolean().nullable().optional(),
  timestamp: z.union([z.string(), z.date()]).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const tenantId = request.headers.get("x-tenant-id") || input.tenantId;
    if (!tenantId) return Response.json({ error: "Missing tenant id." }, { status: 400 });
    const event = await ingestGpsEvent(tenantId, request.headers.get("x-gps-key") || request.headers.get("x-integration-key"), input);
    return Response.json({ success: true, event });
  } catch (error) {
    return phase9ApiError(error);
  }
}

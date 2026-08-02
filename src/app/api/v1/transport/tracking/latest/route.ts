import { requirePermission } from "@/lib/auth/guards";
import { getLatestTracking } from "@/lib/phase9/transport";

export async function GET(request: Request) {
  const ctx = await requirePermission("transport.tracking.read");
  const vehicleId = new URL(request.url).searchParams.get("vehicleId") ?? undefined;
  return Response.json({ events: await getLatestTracking(ctx.tenantId, vehicleId) });
}

import { withApiObservability } from "@/lib/observability/api-handler";
import { NextResponse } from "next/server";
import { ingestGpsEvent, phase9ApiError } from "@/lib/phase9/transport";
import { logger } from "@/lib/logger";

async function POSTHandler(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";

  try {
    if (!tenantId) {
      return NextResponse.json(
        { error: "Missing x-tenant-id header" },
        { status: 400 },
      );
    }

    const body = await req.json();
    if (body.latitude === undefined || body.longitude === undefined || !(body.vehicleId || body.externalVehicleId)) {
      return NextResponse.json(
        { error: "Missing vehicleId/externalVehicleId, latitude, or longitude in body" },
        { status: 400 },
      );
    }
    const event = await ingestGpsEvent(tenantId, req.headers.get("x-gps-key") || req.headers.get("x-integration-key"), body);
    return NextResponse.json({ success: true, message: "Telemetry ingested", event }, { headers: { Deprecation: "true", Link: '</api/v1/transport/tracking/webhook>; rel="successor-version"' } });
  } catch (error) {
    const response = phase9ApiError(error);
    if (response.status < 500) return response;
    // Observability standard logging for CloudWatch/Datadog
    logger.error("GPS webhook 500 error", error, {
      xTenantId: tenantId,
      path: "/api/webhooks/gps",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const POST = withApiObservability(POSTHandler);

import { NextResponse } from "next/server";
import { opsDb } from "@/lib/db/ops";
import { tenants, vehicleTelemetry } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { eq } from "drizzle-orm";
import { writePlatformAuditLog } from "@/lib/platform/audit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  const integrationKey = req.headers.get("x-integration-key") || "";

  try {
    if (!tenantId || !integrationKey) {
      return NextResponse.json(
        { error: "Missing x-tenant-id or x-integration-key headers" },
        { status: 400 },
      );
    }

    // 1. Authenticate using tenant settings
    const tenant = await opsDb.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      logger.warn("GPS webhook: Tenant not found", { tenantId });
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const settings = (tenant.settings || {}) as Record<string, any>;
    const expectedKey = settings.gps_api_key || settings.integration_api_key;

    if (!expectedKey || expectedKey !== integrationKey) {
      logger.warn("GPS webhook: Unauthorized access attempt", { tenantId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body payload
    const body = await req.json();
    const { vehicleId, latitude, longitude, speed, timestamp } = body;

    if (!vehicleId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing vehicleId, latitude, or longitude in body" },
        { status: 400 },
      );
    }

    // Validate date format
    const parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
    if (isNaN(parsedTimestamp.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format" },
        { status: 400 },
      );
    }

    // 3. Write telemetry under RLS tenant context
    await withTenant(tenantId, async (tx) => {
      await tx.insert(vehicleTelemetry).values({
        tenantId,
        vehicleId,
        latitude: String(latitude),
        longitude: String(longitude),
        speed: speed !== undefined ? parseInt(String(speed), 10) : null,
        timestamp: parsedTimestamp,
      });
    });

    // 4. Log Platform Audit event (throttled/system logged)
    await writePlatformAuditLog({
      operatorId: null,
      action: "webhooks.gps_telemetry_received",
      entityType: "vehicle_telemetry",
      entityId: vehicleId,
      metadata: {
        tenantId,
        speed,
        timestamp: parsedTimestamp.toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: "Telemetry ingested" });
  } catch (error: any) {
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

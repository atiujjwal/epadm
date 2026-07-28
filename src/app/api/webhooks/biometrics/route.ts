import { withApiObservability } from "@/lib/observability/api-handler";
import { NextResponse } from "next/server";
import { opsDb } from "@/lib/db/ops";
import {
  tenants,
  attendance,
  studentEnrollments,
  users,
  tenantUsers,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, eq } from "drizzle-orm";
import { writePlatformAuditLog } from "@/lib/platform/audit";
import { logger } from "@/lib/logger";

async function POSTHandler(req: Request) {
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
      logger.warn("Biometrics webhook: Tenant not found", { tenantId });
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const settings = (tenant.settings || {}) as Record<string, unknown>;
    const expectedKey =
      settings.biometric_api_key || settings.integration_api_key;

    if (!expectedKey || expectedKey !== integrationKey) {
      logger.warn("Biometrics webhook: Unauthorized access attempt", {
        tenantId,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body payload
    const body = await req.json();
    const { studentId, timestamp } = body;

    if (!studentId || !timestamp) {
      return NextResponse.json(
        { error: "Missing studentId or timestamp in body" },
        { status: 400 },
      );
    }

    // Parse date from timestamp (e.g. YYYY-MM-DD)
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format" },
        { status: 400 },
      );
    }
    const dateStr = dateObj.toISOString().split("T")[0];

    // 3. Write updates within the RLS transaction context
    const result = await withTenant(tenantId, async (tx) => {
      // Find student class & section enrollment
      const enrollment = await tx
        .select({
          classId: studentEnrollments.classId,
          sectionId: studentEnrollments.sectionId,
        })
        .from(studentEnrollments)
        .where(
          and(
            eq(studentEnrollments.studentId, studentId),
            eq(studentEnrollments.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (enrollment.length === 0) {
        return { success: false, error: "Active student enrollment not found" };
      }

      const classId = enrollment[0].classId;
      const sectionId = enrollment[0].sectionId;

      if (!classId || !sectionId) {
        return {
          success: false,
          error: "Class or section details missing in enrollment record",
        };
      }

      // Resolve the tenant's admin user to attribute who marked it
      const adminUser = await tx
        .select({ id: users.id })
        .from(users)
        .innerJoin(tenantUsers, eq(users.id, tenantUsers.userId))
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.role, "admin"),
          ),
        )
        .limit(1);

      const markedById = adminUser[0]?.id;
      if (!markedById) {
        return { success: false, error: "Tenant admin user not found" };
      }

      // Upsert biometric attendance log
      await tx
        .insert(attendance)
        .values({
          tenantId,
          studentId,
          classId,
          sectionId,
          date: dateStr,
          status: "present",
          notes: "Biometric Webhook Sync",
          markedById,
        })
        .onConflictDoUpdate({
          target: [
            attendance.tenantId,
            attendance.studentId,
            attendance.date,
          ],
          set: {
            status: "present",
            notes: "Biometric Webhook Sync (Updated)",
            markedById,
            updatedAt: new Date(),
          },
        });

      return { success: true };
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 4. Log Platform Audit event
    await writePlatformAuditLog({
      operatorId: null,
      action: "webhooks.biometrics_sync",
      entityType: "attendance",
      entityId: studentId,
      metadata: {
        tenantId,
        date: dateStr,
        source: "biometric_device",
      },
    });

    return NextResponse.json({ success: true, message: "Attendance synced" });
  } catch (error) {
    // Observability standard logging for CloudWatch/Datadog
    logger.error("Biometrics webhook 500 error", error, {
      xTenantId: tenantId,
      path: "/api/webhooks/biometrics",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const POST = withApiObservability(POSTHandler);

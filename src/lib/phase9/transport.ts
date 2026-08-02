import "server-only";

import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import {
  auditLogs,
  feeCategories,
  routeStops,
  studentTransportAllocations,
  students,
  tenantIntegrations,
  vehicleMaintenanceRecords,
  vehicleRoutes,
  vehicleTelemetry,
  vehicleTrackingEvents,
  vehicles,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";

export class Phase9Error extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const maybe = error as { message?: unknown; code?: unknown; constraint?: unknown; detail?: unknown; cause?: unknown };
  return [
    typeof maybe.message === "string" ? maybe.message : "",
    typeof maybe.code === "string" ? maybe.code : "",
    typeof maybe.constraint === "string" ? maybe.constraint : "",
    typeof maybe.detail === "string" ? maybe.detail : "",
    maybe.cause ? errorText(maybe.cause) : "",
  ].filter(Boolean).join(" ");
}

export function phase9ApiError(error: unknown) {
  if (error instanceof Phase9Error) return Response.json({ error: error.message }, { status: error.status });
  if (/23505|duplicate key|unique constraint/i.test(errorText(error))) {
    return Response.json({ error: "A conflicting campus-operations record already exists." }, { status: 409 });
  }
  return Response.json({ error: "Campus operations request failed" }, { status: 500 });
}

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function writeAuditLog(tx: TenantTransaction, input: { tenantId: string; actorUserId?: string | null; action: string; entityType: string; entityId: string; metadata?: Record<string, unknown> }) {
  await tx.insert(auditLogs).values({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}

export async function listTransportModel(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [fleet, routes, stops, allocations, maintenance, latestTracking] = await Promise.all([
      tx.select().from(vehicles).where(eq(vehicles.tenantId, tenantId)).orderBy(asc(vehicles.code)),
      tx.select().from(vehicleRoutes).where(eq(vehicleRoutes.tenantId, tenantId)).orderBy(asc(vehicleRoutes.routeCode)),
      tx.select().from(routeStops).where(eq(routeStops.tenantId, tenantId)).orderBy(asc(routeStops.sequence)),
      tx.select({
        id: studentTransportAllocations.id,
        studentId: studentTransportAllocations.studentId,
        routeId: studentTransportAllocations.routeId,
        pickupStopId: studentTransportAllocations.pickupStopId,
        dropStopId: studentTransportAllocations.dropStopId,
        academicYearId: studentTransportAllocations.academicYearId,
        startDate: studentTransportAllocations.startDate,
        endDate: studentTransportAllocations.endDate,
        monthlyFeePaise: studentTransportAllocations.monthlyFeePaise,
        status: studentTransportAllocations.status,
        studentName: students.firstName,
        admissionNumber: students.admissionNumber,
      }).from(studentTransportAllocations)
        .innerJoin(students, eq(students.id, studentTransportAllocations.studentId))
        .where(eq(studentTransportAllocations.tenantId, tenantId))
        .orderBy(desc(studentTransportAllocations.createdAt)),
      tx.select().from(vehicleMaintenanceRecords).where(eq(vehicleMaintenanceRecords.tenantId, tenantId)).orderBy(desc(vehicleMaintenanceRecords.serviceDate)),
      tx.select().from(vehicleTrackingEvents).where(eq(vehicleTrackingEvents.tenantId, tenantId)).orderBy(desc(vehicleTrackingEvents.recordedAt)).limit(50),
    ]);
    return { fleet, routes, stops, allocations, maintenance, latestTracking };
  });
}

export async function createTransportVehicle(tenantId: string, actorUserId: string, input: {
  code: string;
  numberPlate: string;
  driverName?: string | null;
  driverPhone?: string | null;
  helperName?: string | null;
  helperPhone?: string | null;
  routeName?: string | null;
  capacity?: number;
  makeModel?: string | null;
  fuelType?: string | null;
  gpsDeviceId?: string | null;
  status?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [vehicle] = await tx.insert(vehicles).values({
      tenantId,
      code: input.code.trim().toUpperCase(),
      numberPlate: input.numberPlate.trim().toUpperCase(),
      driverName: clean(input.driverName),
      driverPhone: clean(input.driverPhone),
      helperName: clean(input.helperName),
      helperPhone: clean(input.helperPhone),
      routeName: clean(input.routeName),
      capacity: input.capacity ?? 0,
      makeModel: clean(input.makeModel),
      fuelType: clean(input.fuelType),
      gpsDeviceId: clean(input.gpsDeviceId),
      status: clean(input.status) ?? "active",
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "transport.vehicle.created", entityType: "vehicle", entityId: vehicle.id });
    return vehicle;
  });
}

export async function upsertVehicleRoute(tenantId: string, actorUserId: string, input: {
  routeCode: string;
  name: string;
  vehicleId?: string | null;
  driverName?: string | null;
  helperName?: string | null;
  distanceKm?: string | number | null;
  monthlyFeePaise?: number;
  status?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const routeCode = input.routeCode.trim().toUpperCase();
    const [route] = await tx.insert(vehicleRoutes).values({
      tenantId,
      routeCode,
      name: input.name.trim(),
      vehicleId: input.vehicleId ?? null,
      driverName: clean(input.driverName),
      helperName: clean(input.helperName),
      distanceKm: input.distanceKm == null ? null : String(input.distanceKm),
      monthlyFeePaise: input.monthlyFeePaise ?? 0,
      status: clean(input.status) ?? "active",
    }).onConflictDoUpdate({
      target: [vehicleRoutes.tenantId, vehicleRoutes.routeCode],
      set: {
        name: input.name.trim(),
        vehicleId: input.vehicleId ?? null,
        driverName: clean(input.driverName),
        helperName: clean(input.helperName),
        distanceKm: input.distanceKm == null ? null : String(input.distanceKm),
        monthlyFeePaise: input.monthlyFeePaise ?? 0,
        status: clean(input.status) ?? "active",
        updatedAt: new Date(),
      },
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "transport.route.saved", entityType: "vehicle_route", entityId: route.id });
    return route;
  });
}

export async function saveRouteStops(tenantId: string, actorUserId: string, routeId: string, stops: Array<{ stopName: string; pickupTime?: string | null; dropTime?: string | null; sequence?: number; latitude?: string | number | null; longitude?: string | number | null; feeOverridePaise?: number | null }>) {
  return withTenant(tenantId, async (tx) => {
    const [route] = await tx.select({ id: vehicleRoutes.id }).from(vehicleRoutes).where(and(eq(vehicleRoutes.tenantId, tenantId), eq(vehicleRoutes.id, routeId))).limit(1);
    if (!route) throw new Phase9Error("Transport route not found.", 404);
    await tx.delete(routeStops).where(and(eq(routeStops.tenantId, tenantId), eq(routeStops.routeId, routeId)));
    if (stops.length === 0) return [];
    const rows = await tx.insert(routeStops).values(stops.map((stop, index) => ({
      tenantId,
      routeId,
      stopName: stop.stopName.trim(),
      pickupTime: stop.pickupTime ?? null,
      dropTime: stop.dropTime ?? null,
      sequence: stop.sequence ?? index + 1,
      latitude: stop.latitude == null ? null : String(stop.latitude),
      longitude: stop.longitude == null ? null : String(stop.longitude),
      feeOverridePaise: stop.feeOverridePaise ?? null,
    }))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "transport.route_stops.saved", entityType: "vehicle_route", entityId: routeId, metadata: { count: rows.length } });
    return rows;
  });
}

export async function assignStudentTransport(tenantId: string, actorUserId: string, input: {
  studentId: string;
  routeId: string;
  academicYearId?: string | null;
  pickupStopId?: string | null;
  dropStopId?: string | null;
  startDate: string;
  endDate?: string | null;
  monthlyFeePaise?: number;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [existing] = await tx.select().from(studentTransportAllocations).where(and(
      eq(studentTransportAllocations.tenantId, tenantId),
      eq(studentTransportAllocations.studentId, input.studentId),
      input.academicYearId ? eq(studentTransportAllocations.academicYearId, input.academicYearId) : undefined,
      eq(studentTransportAllocations.status, "active"),
    )).limit(1);
    if (existing) {
      if (existing.routeId === input.routeId) return { allocation: existing, created: false, feeWarning: await transportFeeWarning(tx, tenantId) };
      throw new Phase9Error("Student already has an active transport allocation for this academic year.", 409);
    }
    const [route] = await tx.select().from(vehicleRoutes).where(and(eq(vehicleRoutes.tenantId, tenantId), eq(vehicleRoutes.id, input.routeId))).limit(1);
    if (!route) throw new Phase9Error("Transport route not found.", 404);
    const [allocation] = await tx.insert(studentTransportAllocations).values({
      tenantId,
      studentId: input.studentId,
      academicYearId: input.academicYearId ?? null,
      routeId: input.routeId,
      pickupStopId: input.pickupStopId ?? null,
      dropStopId: input.dropStopId ?? null,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      monthlyFeePaise: input.monthlyFeePaise ?? route.monthlyFeePaise,
      notes: input.notes ?? null,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "transport.allocation.created", entityType: "student_transport_allocation", entityId: allocation.id, metadata: { studentId: input.studentId, routeId: input.routeId } });
    return { allocation, created: true, feeWarning: await transportFeeWarning(tx, tenantId) };
  });
}

async function transportFeeWarning(tx: TenantTransaction, tenantId: string) {
  const [transportCategory] = await tx.select({ value: count() }).from(feeCategories).where(and(eq(feeCategories.tenantId, tenantId), ilike(feeCategories.name, "Transport")));
  return (transportCategory?.value ?? 0) === 0 ? "No Transport fee category exists yet; create one in Finance before invoice generation." : null;
}

export async function recordVehicleMaintenance(tenantId: string, actorUserId: string, input: Omit<typeof vehicleMaintenanceRecords.$inferInsert, "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy">) {
  return withTenant(tenantId, async (tx) => {
    const [record] = await tx.insert(vehicleMaintenanceRecords).values({ ...input, tenantId, createdBy: actorUserId }).returning();
    if (input.nextDueDate) await tx.update(vehicles).set({ nextServiceDate: input.nextDueDate, updatedAt: new Date() }).where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, input.vehicleId)));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "transport.maintenance.recorded", entityType: "vehicle_maintenance_record", entityId: record.id });
    return record;
  });
}

export function isGpsKeyValid(inputKey: string | null, integration?: { status: string; apiKeyHash: string | null; config: Record<string, unknown> } | null) {
  if (!inputKey || !integration || integration.status !== "active") return false;
  const configKey = typeof integration.config.gpsApiKey === "string"
    ? integration.config.gpsApiKey
    : typeof integration.config.integrationApiKey === "string"
      ? integration.config.integrationApiKey
      : null;
  return inputKey === integration.apiKeyHash || inputKey === configKey;
}

export async function ingestGpsEvent(tenantId: string, inputKey: string | null, payload: {
  vehicleId?: string;
  externalVehicleId?: string;
  latitude: string | number;
  longitude: string | number;
  speed?: string | number | null;
  heading?: string | number | null;
  ignitionOn?: boolean | null;
  timestamp?: string | Date | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const integration = await tx.query.tenantIntegrations.findFirst({
      where: and(eq(tenantIntegrations.tenantId, tenantId), eq(tenantIntegrations.integrationKey, "gps")),
    });
    if (!isGpsKeyValid(inputKey, integration)) throw new Phase9Error("Unauthorized GPS webhook request.", 401);
    const externalVehicleId = String(payload.externalVehicleId ?? payload.vehicleId ?? "").trim();
    if (!externalVehicleId) throw new Phase9Error("vehicleId or externalVehicleId is required.", 400);
    const recordedAt = payload.timestamp ? new Date(payload.timestamp) : new Date();
    if (Number.isNaN(recordedAt.getTime())) throw new Phase9Error("Invalid GPS timestamp.", 400);
    const [vehicleById] = UUID_PATTERN.test(externalVehicleId)
      ? await tx.select({ id: vehicles.id }).from(vehicles).where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, externalVehicleId))).limit(1)
      : [];
    const [vehicleByExternal] = vehicleById
      ? []
      : await tx.select({ id: vehicles.id }).from(vehicles).where(and(
        eq(vehicles.tenantId, tenantId),
        or(eq(vehicles.code, externalVehicleId), eq(vehicles.numberPlate, externalVehicleId), eq(vehicles.gpsDeviceId, externalVehicleId)),
      )).limit(1);
    const vehicle = vehicleById ?? vehicleByExternal;
    const speed = payload.speed == null ? null : Number.parseInt(String(payload.speed), 10);
    const [event] = await tx.insert(vehicleTrackingEvents).values({
      tenantId,
      vehicleId: vehicle?.id ?? null,
      externalVehicleId,
      latitude: String(payload.latitude),
      longitude: String(payload.longitude),
      speed: Number.isFinite(speed) ? speed : null,
      heading: payload.heading == null ? null : Number.parseInt(String(payload.heading), 10),
      ignitionOn: payload.ignitionOn ?? null,
      recordedAt,
      payload: payload as Record<string, unknown>,
    }).returning();
    await tx.insert(vehicleTelemetry).values({
      tenantId,
      vehicleId: externalVehicleId,
      latitude: String(payload.latitude),
      longitude: String(payload.longitude),
      speed: Number.isFinite(speed) ? speed : null,
      timestamp: recordedAt,
    });
    return event;
  });
}

export async function getLatestTracking(tenantId: string, vehicleId?: string) {
  return withTenant(tenantId, (tx) =>
    tx.select().from(vehicleTrackingEvents)
      .where(and(eq(vehicleTrackingEvents.tenantId, tenantId), vehicleId ? or(eq(vehicleTrackingEvents.vehicleId, vehicleId), eq(vehicleTrackingEvents.externalVehicleId, vehicleId)) : undefined))
      .orderBy(desc(vehicleTrackingEvents.recordedAt))
      .limit(vehicleId ? 1 : 25),
  );
}

export async function getStudentTransportSummary(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const allocations = await tx.select({
      id: studentTransportAllocations.id,
      routeId: studentTransportAllocations.routeId,
      routeName: vehicleRoutes.name,
      routeCode: vehicleRoutes.routeCode,
      pickupStopId: studentTransportAllocations.pickupStopId,
      dropStopId: studentTransportAllocations.dropStopId,
      startDate: studentTransportAllocations.startDate,
      endDate: studentTransportAllocations.endDate,
      monthlyFeePaise: studentTransportAllocations.monthlyFeePaise,
      status: studentTransportAllocations.status,
    }).from(studentTransportAllocations)
      .innerJoin(vehicleRoutes, eq(vehicleRoutes.id, studentTransportAllocations.routeId))
      .where(and(eq(studentTransportAllocations.tenantId, tenantId), eq(studentTransportAllocations.studentId, studentId)))
      .orderBy(desc(studentTransportAllocations.createdAt));
    const stopIds = allocations.flatMap((allocation) => [allocation.pickupStopId, allocation.dropStopId].filter(Boolean) as string[]);
    const stops = stopIds.length
      ? await tx.select().from(routeStops).where(and(eq(routeStops.tenantId, tenantId), or(...stopIds.map((id) => eq(routeStops.id, id)))))
      : [];
    return { allocations, stops };
  });
}

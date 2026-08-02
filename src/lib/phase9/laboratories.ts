import "server-only";

import { and, asc, count, desc, eq, ne } from "drizzle-orm";
import {
  auditLogs,
  labBookings,
  labConsumables,
  labEquipment,
  labSafetyIncidents,
  laboratories,
  staffProfiles,
  teacherAllocations,
  timetablePeriods,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";
import { Phase9Error } from "./transport";

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

export function consumableWouldGoNegative(currentQuantity: string | number, delta: string | number) {
  return Number(currentQuantity) + Number(delta) < 0;
}

export async function listLaboratoryModel(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [labs, bookings, equipment, consumables, periods] = await Promise.all([
      tx.select({
        id: laboratories.id,
        code: laboratories.code,
        name: laboratories.name,
        labType: laboratories.labType,
        capacity: laboratories.capacity,
        status: laboratories.status,
        inChargeName: staffProfiles.fullName,
      }).from(laboratories)
        .leftJoin(staffProfiles, eq(staffProfiles.id, laboratories.inChargeStaffId))
        .where(eq(laboratories.tenantId, tenantId))
        .orderBy(asc(laboratories.name)),
      tx.select({
        id: labBookings.id,
        laboratoryId: labBookings.laboratoryId,
        labName: labBookings.labName,
        session: labBookings.session,
        topic: labBookings.topic,
        bookingDate: labBookings.bookingDate,
        scheduledAt: labBookings.scheduledAt,
        periodId: labBookings.periodId,
        periodName: timetablePeriods.name,
        sectionId: labBookings.sectionId,
        classLabel: labBookings.classLabel,
        status: labBookings.status,
        inCharge: labBookings.inCharge,
      }).from(labBookings)
        .leftJoin(timetablePeriods, eq(timetablePeriods.id, labBookings.periodId))
        .where(eq(labBookings.tenantId, tenantId))
        .orderBy(desc(labBookings.scheduledAt)),
      tx.select().from(labEquipment).where(eq(labEquipment.tenantId, tenantId)).orderBy(asc(labEquipment.assetCode)),
      tx.select().from(labConsumables).where(eq(labConsumables.tenantId, tenantId)).orderBy(asc(labConsumables.itemCode)),
      tx.select().from(timetablePeriods).where(eq(timetablePeriods.tenantId, tenantId)).orderBy(asc(timetablePeriods.displayOrder)),
    ]);
    return { labs, bookings, equipment, consumables, periods };
  });
}

export async function createLaboratory(tenantId: string, actorUserId: string, input: {
  code: string;
  name: string;
  labType?: string;
  roomId?: string | null;
  capacity?: number;
  inChargeStaffId?: string | null;
  safetyInstructions?: string | null;
  status?: string;
}) {
  return withTenant(tenantId, async (tx) => {
    const [lab] = await tx.insert(laboratories).values({
      tenantId,
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      labType: input.labType ?? "science",
      roomId: input.roomId ?? null,
      capacity: input.capacity ?? 0,
      inChargeStaffId: input.inChargeStaffId ?? null,
      safetyInstructions: input.safetyInstructions ?? null,
      status: input.status ?? "active",
    }).onConflictDoUpdate({
      target: [laboratories.tenantId, laboratories.code],
      set: {
        name: input.name.trim(),
        labType: input.labType ?? "science",
        roomId: input.roomId ?? null,
        capacity: input.capacity ?? 0,
        inChargeStaffId: input.inChargeStaffId ?? null,
        safetyInstructions: input.safetyInstructions ?? null,
        status: input.status ?? "active",
        updatedAt: new Date(),
      },
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.lab.saved", entityType: "laboratory", entityId: lab.id });
    return lab;
  });
}

export async function assertLabBookingAvailable(tx: TenantTransaction, tenantId: string, input: { laboratoryId: string; bookingDate: string; periodId: string; sectionId?: string | null; excludeBookingId?: string | null }) {
  const [labConflict] = await tx.select({ value: count() }).from(labBookings).where(and(
    eq(labBookings.tenantId, tenantId),
    eq(labBookings.laboratoryId, input.laboratoryId),
    eq(labBookings.bookingDate, input.bookingDate),
    eq(labBookings.periodId, input.periodId),
    ne(labBookings.status, "cancelled"),
    input.excludeBookingId ? ne(labBookings.id, input.excludeBookingId) : undefined,
  ));
  if ((labConflict?.value ?? 0) > 0) throw new Phase9Error("Laboratory is already booked for this date and period.", 409);
  if (input.sectionId) {
    const [sectionConflict] = await tx.select({ value: count() }).from(labBookings).where(and(
      eq(labBookings.tenantId, tenantId),
      eq(labBookings.sectionId, input.sectionId),
      eq(labBookings.bookingDate, input.bookingDate),
      eq(labBookings.periodId, input.periodId),
      ne(labBookings.status, "cancelled"),
      input.excludeBookingId ? ne(labBookings.id, input.excludeBookingId) : undefined,
    ));
    if ((sectionConflict?.value ?? 0) > 0) throw new Phase9Error("Section already has a lab booking for this date and period.", 409);
  }
}

export async function createLabBooking(tenantId: string, actorUserId: string, input: {
  laboratoryId: string;
  session: string;
  bookingDate: string;
  periodId: string;
  sectionId?: string | null;
  teacherStaffId?: string | null;
  topic?: string | null;
  classLabel?: string | null;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [lab] = await tx.select().from(laboratories).where(and(eq(laboratories.tenantId, tenantId), eq(laboratories.id, input.laboratoryId))).limit(1);
    if (!lab) throw new Phase9Error("Laboratory not found.", 404);
    const [period] = await tx.select().from(timetablePeriods).where(and(eq(timetablePeriods.tenantId, tenantId), eq(timetablePeriods.id, input.periodId))).limit(1);
    if (!period) throw new Phase9Error("Timetable period not found.", 404);
    await assertLabBookingAvailable(tx, tenantId, input);
    if (input.teacherStaffId && input.sectionId) {
      const [allocation] = await tx.select({ value: count() }).from(teacherAllocations).where(and(
        eq(teacherAllocations.tenantId, tenantId),
        eq(teacherAllocations.staffId, input.teacherStaffId),
        eq(teacherAllocations.sectionId, input.sectionId),
      ));
      if ((allocation?.value ?? 0) === 0) throw new Phase9Error("Teacher is not allocated to this section.", 403);
    }
    const scheduledAt = new Date(`${input.bookingDate}T${period.startTime}:00`);
    const [booking] = await tx.insert(labBookings).values({
      tenantId,
      labName: lab.name,
      laboratoryId: lab.id,
      session: input.session.trim(),
      topic: input.topic ?? input.session.trim(),
      classLabel: input.classLabel ?? null,
      sectionId: input.sectionId ?? null,
      periodId: input.periodId,
      bookingDate: input.bookingDate,
      teacherStaffId: input.teacherStaffId ?? null,
      inCharge: null,
      scheduledAt,
      status: "scheduled",
      notes: input.notes ?? null,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.booking.created", entityType: "lab_booking", entityId: booking.id });
    return booking;
  });
}

export async function cancelLabBooking(tenantId: string, actorUserId: string, bookingId: string, reason?: string | null) {
  return withTenant(tenantId, async (tx) => {
    const [booking] = await tx.update(labBookings).set({ status: "cancelled", cancelledAt: new Date(), cancelledBy: actorUserId, cancellationReason: reason ?? null, updatedAt: new Date() }).where(and(eq(labBookings.tenantId, tenantId), eq(labBookings.id, bookingId))).returning();
    if (!booking) throw new Phase9Error("Lab booking not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.booking.cancelled", entityType: "lab_booking", entityId: bookingId, metadata: { reason } });
    return booking;
  });
}

export async function saveLabEquipment(tenantId: string, actorUserId: string, input: {
  laboratoryId: string;
  assetCode: string;
  name: string;
  category?: string | null;
  quantity?: number;
  workingQuantity?: number;
  condition?: string;
  status?: string;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [row] = await tx.insert(labEquipment).values({
      tenantId,
      laboratoryId: input.laboratoryId,
      assetCode: input.assetCode.trim().toUpperCase(),
      name: input.name.trim(),
      category: input.category ?? null,
      quantity: input.quantity ?? 1,
      workingQuantity: input.workingQuantity ?? input.quantity ?? 1,
      condition: input.condition ?? "good",
      status: input.status ?? "active",
      notes: input.notes ?? null,
    }).onConflictDoUpdate({
      target: [labEquipment.tenantId, labEquipment.assetCode],
      set: {
        name: input.name.trim(),
        category: input.category ?? null,
        quantity: input.quantity ?? 1,
        workingQuantity: input.workingQuantity ?? input.quantity ?? 1,
        condition: input.condition ?? "good",
        status: input.status ?? "active",
        notes: input.notes ?? null,
        updatedAt: new Date(),
      },
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.equipment.saved", entityType: "lab_equipment", entityId: row.id });
    return row;
  });
}

export async function saveLabConsumable(tenantId: string, actorUserId: string, input: {
  laboratoryId: string;
  itemCode: string;
  name: string;
  unit?: string;
  quantityOnHand?: string | number;
  reorderLevel?: string | number;
  unitCostPaise?: number;
  hazardClass?: string | null;
  expiryDate?: string | null;
  status?: string;
}) {
  return withTenant(tenantId, async (tx) => {
    const [row] = await tx.insert(labConsumables).values({
      tenantId,
      laboratoryId: input.laboratoryId,
      itemCode: input.itemCode.trim().toUpperCase(),
      name: input.name.trim(),
      unit: input.unit ?? "unit",
      quantityOnHand: String(input.quantityOnHand ?? 0),
      reorderLevel: String(input.reorderLevel ?? 0),
      unitCostPaise: input.unitCostPaise ?? 0,
      hazardClass: input.hazardClass ?? null,
      expiryDate: input.expiryDate ?? null,
      status: input.status ?? "active",
    }).onConflictDoUpdate({
      target: [labConsumables.tenantId, labConsumables.itemCode],
      set: {
        name: input.name.trim(),
        unit: input.unit ?? "unit",
        quantityOnHand: String(input.quantityOnHand ?? 0),
        reorderLevel: String(input.reorderLevel ?? 0),
        unitCostPaise: input.unitCostPaise ?? 0,
        hazardClass: input.hazardClass ?? null,
        expiryDate: input.expiryDate ?? null,
        status: input.status ?? "active",
        updatedAt: new Date(),
      },
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.consumable.saved", entityType: "lab_consumable", entityId: row.id });
    return row;
  });
}

export async function adjustLabConsumableStock(tenantId: string, actorUserId: string, consumableId: string, delta: string | number) {
  return withTenant(tenantId, async (tx) => {
    const [item] = await tx.select().from(labConsumables).where(and(eq(labConsumables.tenantId, tenantId), eq(labConsumables.id, consumableId))).limit(1);
    if (!item) throw new Phase9Error("Lab consumable not found.", 404);
    if (consumableWouldGoNegative(item.quantityOnHand, delta)) throw new Phase9Error("Consumable stock cannot go negative.", 422);
    const next = Number(item.quantityOnHand) + Number(delta);
    const [updated] = await tx.update(labConsumables).set({ quantityOnHand: String(next), updatedAt: new Date() }).where(and(eq(labConsumables.tenantId, tenantId), eq(labConsumables.id, consumableId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.consumable.adjusted", entityType: "lab_consumable", entityId: consumableId, metadata: { delta, next } });
    return updated;
  });
}

export async function recordLabSafetyIncident(tenantId: string, actorUserId: string, input: {
  laboratoryId: string;
  bookingId?: string | null;
  incidentDate: string;
  severity?: string;
  title: string;
  description?: string | null;
  actionTaken?: string | null;
  status?: string;
}) {
  return withTenant(tenantId, async (tx) => {
    const [incident] = await tx.insert(labSafetyIncidents).values({
      tenantId,
      laboratoryId: input.laboratoryId,
      bookingId: input.bookingId ?? null,
      incidentDate: input.incidentDate,
      severity: input.severity ?? "low",
      title: input.title.trim(),
      description: input.description ?? null,
      actionTaken: input.actionTaken ?? null,
      reportedBy: actorUserId,
      status: input.status ?? "open",
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "laboratories.safety_incident.recorded", entityType: "lab_safety_incident", entityId: incident.id });
    return incident;
  });
}

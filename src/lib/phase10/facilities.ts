import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  facilityBookings,
  facilitySpaces,
  facilityWorkOrders,
  healthRecords,
  staffProfiles,
  students,
  visitorRecords,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { clean, hasHealthRecordAccess, Phase10Error, writeAuditLog } from "./shared";

function priorityWeight(priority: string | null) {
  return priority === "emergency" ? 0 : priority === "urgent" ? 1 : priority === "normal" ? 2 : 3;
}

export async function listFacilitiesModel(tenantId: string, includeHealth = false) {
  return withTenant(tenantId, async (tx) => {
    const [spaces, bookings, workOrders, visitors, health] = await Promise.all([
      tx.select().from(facilitySpaces).where(eq(facilitySpaces.tenantId, tenantId)).orderBy(asc(facilitySpaces.name)),
      tx.select().from(facilityBookings).where(eq(facilityBookings.tenantId, tenantId)).orderBy(desc(facilityBookings.bookingDate), asc(facilityBookings.startTime)),
      tx.select({
        id: facilityWorkOrders.id,
        workOrderNumber: facilityWorkOrders.workOrderNumber,
        title: facilityWorkOrders.title,
        category: facilityWorkOrders.category,
        priority: facilityWorkOrders.priority,
        location: facilityWorkOrders.location,
        status: facilityWorkOrders.status,
        dueDate: facilityWorkOrders.dueDate,
        costPaise: facilityWorkOrders.costPaise,
        assignedToName: staffProfiles.fullName,
        createdAt: facilityWorkOrders.createdAt,
      }).from(facilityWorkOrders)
        .leftJoin(staffProfiles, eq(staffProfiles.id, facilityWorkOrders.assignedTo))
        .where(eq(facilityWorkOrders.tenantId, tenantId)),
      tx.select().from(visitorRecords).where(eq(visitorRecords.tenantId, tenantId)).orderBy(desc(visitorRecords.checkIn)),
      includeHealth
        ? tx.select({
          id: healthRecords.id,
          studentId: healthRecords.studentId,
          studentName: students.firstName,
          admissionNumber: students.admissionNumber,
          visitAt: healthRecords.visitAt,
          complaint: healthRecords.complaint,
          diagnosis: healthRecords.diagnosis,
          treatment: healthRecords.treatment,
          isEmergency: healthRecords.isEmergency,
          parentNotified: healthRecords.parentNotified,
        }).from(healthRecords)
          .innerJoin(students, eq(students.id, healthRecords.studentId))
          .where(eq(healthRecords.tenantId, tenantId))
          .orderBy(desc(healthRecords.visitAt))
        : Promise.resolve([]),
    ]);
    return {
      spaces,
      bookings,
      workOrders: workOrders.sort((left, right) => priorityWeight(left.priority) - priorityWeight(right.priority) || Number(right.createdAt) - Number(left.createdAt)),
      visitors,
      healthRecords: health,
    };
  });
}

export async function createFacilitySpace(tenantId: string, actorUserId: string, input: {
  name: string;
  spaceType?: string | null;
  capacity?: number;
  location?: string | null;
  roomId?: string | null;
  isBookable?: boolean;
}) {
  return withTenant(tenantId, async (tx) => {
    const [space] = await tx.insert(facilitySpaces).values({
      tenantId,
      name: input.name.trim(),
      spaceType: clean(input.spaceType) ?? "hall",
      capacity: input.capacity ?? 0,
      location: clean(input.location),
      roomId: input.roomId ?? null,
      isBookable: input.isBookable ?? true,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.space.created", entityType: "facility_space", entityId: space.id });
    return space;
  });
}

export async function createFacilityBooking(tenantId: string, actorUserId: string, input: {
  spaceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    if (input.startTime >= input.endTime) throw new Phase10Error("Booking start time must be before end time.", 422);
    const [overlap] = await tx.select({ id: facilityBookings.id }).from(facilityBookings).where(and(
      eq(facilityBookings.tenantId, tenantId),
      eq(facilityBookings.spaceId, input.spaceId),
      eq(facilityBookings.bookingDate, input.bookingDate),
      inArray(facilityBookings.status, ["pending", "confirmed"]),
      sql`${facilityBookings.startTime} < ${input.endTime}`,
      sql`${facilityBookings.endTime} > ${input.startTime}`,
    )).limit(1);
    if (overlap) throw new Phase10Error("Space is already booked for this time slot.", 409);
    const [booking] = await tx.insert(facilityBookings).values({
      tenantId,
      spaceId: input.spaceId,
      bookingDate: input.bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
      purpose: input.purpose.trim(),
      requestedBy: actorUserId,
      notes: clean(input.notes),
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.booking.created", entityType: "facility_booking", entityId: booking.id });
    return booking;
  });
}

export async function createWorkOrder(tenantId: string, actorUserId: string, input: {
  title: string;
  category?: string | null;
  priority?: string | null;
  location?: string | null;
  description?: string | null;
  dueDate?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [{ value }] = await tx.select({ value: sql<number>`count(*)::int` }).from(facilityWorkOrders).where(eq(facilityWorkOrders.tenantId, tenantId));
    const number = `WO-${new Date().getFullYear()}-${String((value ?? 0) + 1).padStart(5, "0")}`;
    const [workOrder] = await tx.insert(facilityWorkOrders).values({
      tenantId,
      workOrderNumber: number,
      title: input.title.trim(),
      category: clean(input.category) ?? "maintenance",
      priority: clean(input.priority) ?? "normal",
      location: clean(input.location),
      description: clean(input.description),
      dueDate: input.dueDate ?? null,
      requestedBy: actorUserId,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.work_order.created", entityType: "facility_work_order", entityId: workOrder.id });
    return workOrder;
  });
}

export async function assignWorkOrder(tenantId: string, actorUserId: string, workOrderId: string, staffId: string) {
  return withTenant(tenantId, async (tx) => {
    const [workOrder] = await tx.update(facilityWorkOrders).set({ assignedTo: staffId, status: "assigned", updatedAt: new Date() })
      .where(and(eq(facilityWorkOrders.tenantId, tenantId), eq(facilityWorkOrders.id, workOrderId))).returning();
    if (!workOrder) throw new Phase10Error("Work order not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.work_order.assigned", entityType: "facility_work_order", entityId: workOrderId, metadata: { staffId } });
    return workOrder;
  });
}

export async function completeWorkOrder(tenantId: string, actorUserId: string, workOrderId: string, input: { costPaise?: number; notes?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [workOrder] = await tx.update(facilityWorkOrders).set({
      status: "completed",
      completedAt: new Date(),
      costPaise: input.costPaise ?? 0,
      notes: clean(input.notes),
      updatedAt: new Date(),
    }).where(and(eq(facilityWorkOrders.tenantId, tenantId), eq(facilityWorkOrders.id, workOrderId))).returning();
    if (!workOrder) throw new Phase10Error("Work order not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.work_order.completed", entityType: "facility_work_order", entityId: workOrderId });
    return workOrder;
  });
}

export async function signInVisitor(tenantId: string, actorUserId: string, input: {
  visitorName: string;
  phone: string;
  purpose: string;
  whomToMeet: string;
  studentId?: string | null;
  idType?: string | null;
  idLast4?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [{ value }] = await tx.select({ value: sql<number>`count(*)::int` }).from(visitorRecords).where(eq(visitorRecords.tenantId, tenantId));
    const passNumber = `VIS-${new Date().getFullYear()}-${String((value ?? 0) + 1).padStart(5, "0")}`;
    const [visitor] = await tx.insert(visitorRecords).values({
      tenantId,
      passNumber,
      visitorName: input.visitorName.trim(),
      phone: input.phone.trim(),
      purpose: input.purpose.trim(),
      whomToMeet: input.whomToMeet.trim(),
      studentId: input.studentId ?? null,
      idType: clean(input.idType),
      idLast4: clean(input.idLast4)?.slice(-4) ?? null,
      createdBy: actorUserId,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.visitor.signed_in", entityType: "visitor_record", entityId: visitor.id });
    return visitor;
  });
}

export async function signOutVisitor(tenantId: string, actorUserId: string, visitorId: string) {
  return withTenant(tenantId, async (tx) => {
    const [visitor] = await tx.update(visitorRecords).set({ checkOut: new Date() })
      .where(and(eq(visitorRecords.tenantId, tenantId), eq(visitorRecords.id, visitorId))).returning();
    if (!visitor) throw new Phase10Error("Visitor record not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.visitor.signed_out", entityType: "visitor_record", entityId: visitorId });
    return visitor;
  });
}

export async function recordHealthVisit(tenantId: string, actorUserId: string, permissions: readonly string[], input: {
  studentId: string;
  visitAt: string | Date;
  complaint: string;
  diagnosis?: string | null;
  treatment?: string | null;
  medication?: string | null;
  temperature?: string | null;
  bloodPressure?: string | null;
  isEmergency?: boolean;
  parentNotified?: boolean;
  referredTo?: string | null;
  referredAt?: string | Date | null;
}) {
  if (!hasHealthRecordAccess(permissions)) throw new Phase10Error("Forbidden", 403);
  return withTenant(tenantId, async (tx) => {
    const [record] = await tx.insert(healthRecords).values({
      tenantId,
      studentId: input.studentId,
      visitAt: new Date(input.visitAt),
      complaint: input.complaint.trim(),
      diagnosis: clean(input.diagnosis),
      treatment: clean(input.treatment),
      medication: clean(input.medication),
      temperature: clean(input.temperature),
      bloodPressure: clean(input.bloodPressure),
      isEmergency: input.isEmergency ?? false,
      parentNotified: input.parentNotified ?? input.isEmergency ?? false,
      referredTo: clean(input.referredTo),
      referredAt: input.referredAt ? new Date(input.referredAt) : null,
      recordedBy: actorUserId,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "facilities.health.recorded", entityType: "health_record", entityId: record.id });
    return record;
  });
}

export async function getStudentHealthSummary(tenantId: string, studentId: string, permissions: readonly string[]) {
  if (!hasHealthRecordAccess(permissions)) throw new Phase10Error("Forbidden", 403);
  return withTenant(tenantId, (tx) =>
    tx.select().from(healthRecords)
      .where(and(eq(healthRecords.tenantId, tenantId), eq(healthRecords.studentId, studentId)))
      .orderBy(desc(healthRecords.visitAt)),
  );
}

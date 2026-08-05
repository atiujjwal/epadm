import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import {
  hostelAllocations,
  hostelBuildings,
  hostelLeavePasses,
  hostelRooms,
  staffProfiles,
  students,
} from "@/lib/db";
import { withTenant, type TenantTransaction } from "@/lib/rls";
import { clean, Phase10Error, writeAuditLog } from "./shared";

export async function listHostelModel(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [buildings, rooms, allocations, leavePasses] = await Promise.all([
      tx.select({
        id: hostelBuildings.id,
        name: hostelBuildings.name,
        buildingType: hostelBuildings.buildingType,
        totalRooms: hostelBuildings.totalRooms,
        capacity: hostelBuildings.capacity,
        isActive: hostelBuildings.isActive,
        wardenName: staffProfiles.fullName,
      }).from(hostelBuildings)
        .leftJoin(staffProfiles, eq(staffProfiles.id, hostelBuildings.wardenId))
        .where(eq(hostelBuildings.tenantId, tenantId))
        .orderBy(asc(hostelBuildings.name)),
      tx.select().from(hostelRooms).where(eq(hostelRooms.tenantId, tenantId)).orderBy(asc(hostelRooms.roomNumber)),
      tx.select({
        id: hostelAllocations.id,
        studentId: hostelAllocations.studentId,
        roomId: hostelAllocations.roomId,
        academicYearId: hostelAllocations.academicYearId,
        checkInDate: hostelAllocations.checkInDate,
        checkOutDate: hostelAllocations.checkOutDate,
        status: hostelAllocations.status,
        studentName: students.firstName,
        admissionNumber: students.admissionNumber,
      }).from(hostelAllocations)
        .innerJoin(students, eq(students.id, hostelAllocations.studentId))
        .where(eq(hostelAllocations.tenantId, tenantId))
        .orderBy(desc(hostelAllocations.createdAt)),
      tx.select().from(hostelLeavePasses).where(eq(hostelLeavePasses.tenantId, tenantId)).orderBy(desc(hostelLeavePasses.createdAt)),
    ]);
    return { buildings, rooms, allocations, leavePasses };
  });
}

export async function createHostelBuilding(tenantId: string, actorUserId: string, input: {
  name: string;
  buildingType?: string | null;
  wardenId?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [building] = await tx.insert(hostelBuildings).values({
      tenantId,
      name: input.name.trim(),
      buildingType: clean(input.buildingType) ?? "mixed",
      wardenId: input.wardenId ?? null,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hostel.building.created", entityType: "hostel_building", entityId: building.id });
    return building;
  });
}

async function refreshBuildingTotals(tx: TenantTransaction, tenantId: string, buildingId: string) {
  const rows = await tx.select().from(hostelRooms).where(and(eq(hostelRooms.tenantId, tenantId), eq(hostelRooms.buildingId, buildingId)));
  await tx.update(hostelBuildings).set({
    totalRooms: rows.length,
    capacity: rows.reduce((sum, room) => sum + room.capacity, 0),
    updatedAt: new Date(),
  }).where(and(eq(hostelBuildings.tenantId, tenantId), eq(hostelBuildings.id, buildingId)));
}

export async function createHostelRoom(tenantId: string, actorUserId: string, input: {
  buildingId: string;
  roomNumber: string;
  floor?: number;
  roomType?: string | null;
  capacity?: number;
  amenities?: string[];
  monthlyFeePaise?: number;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [building] = await tx.select({ id: hostelBuildings.id }).from(hostelBuildings)
      .where(and(eq(hostelBuildings.tenantId, tenantId), eq(hostelBuildings.id, input.buildingId))).limit(1);
    if (!building) throw new Phase10Error("Hostel building not found.", 404);
    const [room] = await tx.insert(hostelRooms).values({
      tenantId,
      buildingId: input.buildingId,
      roomNumber: input.roomNumber.trim(),
      floor: input.floor ?? 0,
      roomType: clean(input.roomType) ?? "shared",
      capacity: input.capacity ?? 2,
      amenities: input.amenities ?? [],
      monthlyFeePaise: input.monthlyFeePaise ?? 0,
      notes: clean(input.notes),
    }).returning();
    await refreshBuildingTotals(tx, tenantId, input.buildingId);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hostel.room.created", entityType: "hostel_room", entityId: room.id });
    return room;
  });
}

export async function allocateStudentHostel(tenantId: string, actorUserId: string, input: {
  studentId: string;
  roomId: string;
  academicYearId: string;
  checkInDate: string;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [existing] = await tx.select({ id: hostelAllocations.id }).from(hostelAllocations).where(and(
      eq(hostelAllocations.tenantId, tenantId),
      eq(hostelAllocations.studentId, input.studentId),
      eq(hostelAllocations.academicYearId, input.academicYearId),
      eq(hostelAllocations.status, "active"),
    )).limit(1);
    if (existing) throw new Phase10Error("Student already has an active hostel allocation for this academic year.", 409);

    const [room] = await tx.select().from(hostelRooms).where(and(eq(hostelRooms.tenantId, tenantId), eq(hostelRooms.id, input.roomId))).limit(1);
    if (!room) throw new Phase10Error("Hostel room not found.", 404);
    if (room.status === "maintenance" || room.status === "closed") throw new Phase10Error("Room is not available for allocation.", 422);
    if (room.currentOccupancy >= room.capacity) throw new Phase10Error("Room is at capacity.", 422);

    const [allocation] = await tx.insert(hostelAllocations).values({
      tenantId,
      studentId: input.studentId,
      roomId: input.roomId,
      academicYearId: input.academicYearId,
      checkInDate: input.checkInDate,
      allocatedBy: actorUserId,
      notes: clean(input.notes),
    }).returning();
    const newOccupancy = room.currentOccupancy + 1;
    await tx.update(hostelRooms).set({
      currentOccupancy: newOccupancy,
      status: newOccupancy >= room.capacity ? "full" : "available",
      updatedAt: new Date(),
    }).where(and(eq(hostelRooms.tenantId, tenantId), eq(hostelRooms.id, input.roomId)));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hostel.allocation.created", entityType: "hostel_allocation", entityId: allocation.id, metadata: { studentId: input.studentId, roomId: input.roomId } });
    return allocation;
  });
}

export async function checkoutHostelAllocation(tenantId: string, actorUserId: string, allocationId: string, input: { checkOutDate: string; reason?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [allocation] = await tx.select().from(hostelAllocations).where(and(eq(hostelAllocations.tenantId, tenantId), eq(hostelAllocations.id, allocationId))).limit(1);
    if (!allocation) throw new Phase10Error("Hostel allocation not found.", 404);
    if (allocation.status !== "active") return allocation;
    const [room] = await tx.select().from(hostelRooms).where(and(eq(hostelRooms.tenantId, tenantId), eq(hostelRooms.id, allocation.roomId))).limit(1);
    const [updated] = await tx.update(hostelAllocations).set({
      status: "checked_out",
      checkOutDate: input.checkOutDate,
      notes: clean(input.reason) ?? allocation.notes,
      updatedAt: new Date(),
    }).where(and(eq(hostelAllocations.tenantId, tenantId), eq(hostelAllocations.id, allocationId))).returning();
    if (room) {
      const newOccupancy = Math.max(0, room.currentOccupancy - 1);
      await tx.update(hostelRooms).set({
        currentOccupancy: newOccupancy,
        status: room.status === "full" ? "available" : room.status,
        updatedAt: new Date(),
      }).where(and(eq(hostelRooms.tenantId, tenantId), eq(hostelRooms.id, room.id)));
    }
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hostel.allocation.checked_out", entityType: "hostel_allocation", entityId: allocationId });
    return updated;
  });
}

export async function createHostelLeavePass(tenantId: string, actorUserId: string, input: {
  allocationId: string;
  leaveFrom: string | Date;
  leaveTo: string | Date;
  destination: string;
  contactPerson?: string | null;
  contactPhone?: string | null;
  reason: string;
}) {
  return withTenant(tenantId, async (tx) => {
    const [allocation] = await tx.select().from(hostelAllocations).where(and(eq(hostelAllocations.tenantId, tenantId), eq(hostelAllocations.id, input.allocationId))).limit(1);
    if (!allocation || allocation.status !== "active") throw new Phase10Error("Active hostel allocation not found.", 404);
    const [leavePass] = await tx.insert(hostelLeavePasses).values({
      tenantId,
      allocationId: input.allocationId,
      studentId: allocation.studentId,
      leaveFrom: new Date(input.leaveFrom),
      leaveTo: new Date(input.leaveTo),
      destination: input.destination.trim(),
      contactPerson: clean(input.contactPerson),
      contactPhone: clean(input.contactPhone),
      reason: input.reason.trim(),
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hostel.leave_pass.created", entityType: "hostel_leave_pass", entityId: leavePass.id });
    return leavePass;
  });
}

export async function decideHostelLeavePass(tenantId: string, actorUserId: string, leavePassId: string, input: { status: "approved" | "rejected" | "returned"; note?: string | null; actualReturn?: string | Date | null }) {
  return withTenant(tenantId, async (tx) => {
    const updates: Partial<typeof hostelLeavePasses.$inferInsert> = {
      status: input.status,
      approvalNote: clean(input.note),
      actualReturn: input.actualReturn ? new Date(input.actualReturn) : input.status === "returned" ? new Date() : null,
      updatedAt: new Date(),
    };
    if (input.status !== "returned") updates.approvedBy = actorUserId;
    const [leavePass] = await tx.update(hostelLeavePasses).set(updates).where(and(eq(hostelLeavePasses.tenantId, tenantId), eq(hostelLeavePasses.id, leavePassId))).returning();
    if (!leavePass) throw new Phase10Error("Hostel leave pass not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: `hostel.leave_pass.${input.status}`, entityType: "hostel_leave_pass", entityId: leavePassId });
    return leavePass;
  });
}

export async function getStudentHostelSummary(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const allocations = await tx.select({
      id: hostelAllocations.id,
      roomId: hostelAllocations.roomId,
      roomNumber: hostelRooms.roomNumber,
      buildingId: hostelRooms.buildingId,
      buildingName: hostelBuildings.name,
      academicYearId: hostelAllocations.academicYearId,
      checkInDate: hostelAllocations.checkInDate,
      checkOutDate: hostelAllocations.checkOutDate,
      status: hostelAllocations.status,
    }).from(hostelAllocations)
      .innerJoin(hostelRooms, eq(hostelRooms.id, hostelAllocations.roomId))
      .innerJoin(hostelBuildings, eq(hostelBuildings.id, hostelRooms.buildingId))
      .where(and(eq(hostelAllocations.tenantId, tenantId), eq(hostelAllocations.studentId, studentId)))
      .orderBy(desc(hostelAllocations.createdAt));
    const leavePasses = await tx.select().from(hostelLeavePasses)
      .where(and(eq(hostelLeavePasses.tenantId, tenantId), eq(hostelLeavePasses.studentId, studentId)))
      .orderBy(desc(hostelLeavePasses.createdAt));
    return { allocations, leavePasses };
  });
}

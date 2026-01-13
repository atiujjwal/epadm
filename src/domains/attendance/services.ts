import { PoolClient } from "pg";
import { eq, and, isNull, sql, inArray, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { attendanceLogs, devices } from "./schema";
import { students } from "../academic-core/schema";
import { MarkAttendanceInput, AttendanceStatus } from "./types";
import { requirePermission } from "@/lib/auth/rbac";

// ==========================================
// MANUAL ATTENDANCE (Teacher App)
// ==========================================

export async function markAttendance(
  client: PoolClient,
  tenantId: string,
  userId: string,
  academicYearId: string,
  data: MarkAttendanceInput
) {
  await requirePermission(client, userId, "attendance.write");
  const db = drizzle(client);

  // Normalize Date to Midnight UTC or Tenant Timezone
  const logDate = new Date(data.date);
  logDate.setHours(0, 0, 0, 0);

  // Upsert Logic: Last Write Wins
  // If a record exists for this Student + Date, update it.
  const result = await db
    .insert(attendanceLogs)
    .values({
      tenantId,
      studentId: data.studentId,
      academicYearId,
      date: logDate,
      status: data.status,
      source: "MANUAL",
      markedById: userId,
      remarks: data.remarks,
      checkInTime: data.checkInTime ? new Date(data.checkInTime) : null,
      updatedAt: new Date(), // Critical for Sync
    })
    .onConflictDoUpdate({
      target: [attendanceLogs.studentId, attendanceLogs.date], // Requires Unique Index in DB
      set: {
        status: data.status,
        source: "MANUAL",
        markedById: userId,
        remarks: data.remarks,
        checkInTime: data.checkInTime ? new Date(data.checkInTime) : null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
}

export async function getClassAttendance(
  client: PoolClient,
  tenantId: string,
  userId: string,
  classId: string,
  date: string
) {
  await requirePermission(client, userId, "attendance.read");
  const db = drizzle(client);

  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);

  // Join with Students to get names even if no log exists (Frontend handles "Unknown" as Absent/Pending)
  return await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      rollNumber: students.rollNumber,
      status: attendanceLogs.status,
      remarks: attendanceLogs.remarks,
    })
    .from(students)
    .leftJoin(
      attendanceLogs,
      and(
        eq(attendanceLogs.studentId, students.id),
        eq(attendanceLogs.date, queryDate),
        isNull(attendanceLogs.deletedAt)
      )
    )
    .where(
      and(
        eq(students.tenantId, tenantId),
        eq(students.sectionId, classId), // Assuming classId passed is sectionId actually
        isNull(students.deletedAt)
      )
    );
}

// ==========================================
// BIOMETRIC INGESTION (IoT Service)
// ==========================================

export async function processBiometricLog(
  client: PoolClient,
  serialNumber: string, // Device Serial
  userPin: string, // ID on device (mapped to Student Admission No)
  timestampStr: string
) {
  // NOTE: This runs in the Node.js Microservice context, possibly as "System" user.
  // We assume the caller has resolved the Tenant via Serial Number.

  const db = drizzle(client);

  // 1. Resolve Tenant & Device
  const device = await db.query.devices.findFirst({
    where: eq(devices.serialNumber, serialNumber),
  });

  if (!device) throw new Error("Unknown Device");

  // 2. Resolve Student (Mapping PIN -> Admission Number)
  const student = await db.query.students.findFirst({
    where: and(
      eq(students.tenantId, device.tenantId),
      eq(students.admissionNumber, userPin)
    ),
  });

  if (!student) return; // Ignore unknown users (or log to audit)

  // 3. Determine Status (Simple Logic: First Punch = Present)
  // In production, complex shift logic goes here (Late vs On Time)
  const logDate = new Date(timestampStr);
  logDate.setHours(0, 0, 0, 0);

  // 4. Insert/Update
  await db
    .insert(attendanceLogs)
    .values({
      tenantId: device.tenantId,
      studentId: student.id,
      academicYearId: student.academicYearId, // Get from student record
      date: logDate,
      status: "PRESENT",
      source: "BIOMETRIC",
      deviceId: device.id,
      checkInTime: new Date(timestampStr),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [attendanceLogs.studentId, attendanceLogs.date],
      set: {
        // Only update if current status is ABSENT or we want to update check-out time
        checkOutTime: new Date(timestampStr), // Last punch implies check-out
        updatedAt: new Date(),
      },
    });
}

// ==========================================
// MOBILE SYNC (WatermelonDB Protocol)
// ==========================================

export async function getAttendanceChanges(
  client: PoolClient,
  tenantId: string,
  userId: string,
  lastPulledAt: number
) {
  await requirePermission(client, userId, "attendance.read");
  const db = drizzle(client);

  const since = new Date(lastPulledAt);

  // 1. Fetch Created/Updated
  const updated = await db
    .select()
    .from(attendanceLogs)
    .where(
      and(
        eq(attendanceLogs.tenantId, tenantId),
        gt(attendanceLogs.updatedAt, since)
      )
    );

  // 2. Fetch Deleted (Soft Deletes)
  // In our schema, we use `deletedAt` column.
  // WatermelonDB expects a list of IDs for deletion.
  const deletedRecords = await db
    .select({ id: attendanceLogs.id })
    .from(attendanceLogs)
    .where(
      and(
        eq(attendanceLogs.tenantId, tenantId),
        gt(attendanceLogs.updatedAt, since), // Even deletion updates 'updatedAt'
        sql`${attendanceLogs.deletedAt} IS NOT NULL`
      )
    );

  return {
    changes: {
      attendance_logs: {
        created: [], // We treat everything as "updated" for simplicity in WatermelonDB
        updated: updated.filter((r) => !r.deletedAt),
        deleted: deletedRecords.map((r) => r.id),
      },
    },
    timestamp: Date.now(),
  };
}

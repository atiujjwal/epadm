import { PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { syncLogs } from "./schema";
import { getAttendanceChanges, markAttendance } from "../attendance/services";
import { getCommunicationChanges } from "../communication/services";
import { SyncPullResult, SyncPushRequest } from "./types";

// ==========================================
// PULL (Server -> App)
// ==========================================

export async function processPullSync(
  client: PoolClient,
  tenantId: string,
  userId: string,
  lastPulledAt: number,
  deviceId?: string
): Promise<SyncPullResult> {
  const db = drizzle(client);
  const startTime = Date.now();

  // 1. Parallel Fetch from Domains
  // We ask each domain: "What changed since X?"
  const [attendance, communication] = await Promise.all([
    getAttendanceChanges(client, tenantId, userId, lastPulledAt),
    getCommunicationChanges(client, tenantId, userId, lastPulledAt),
  ]);

  // 2. Aggregate
  const response: SyncPullResult = {
    changes: {
      ...attendance.changes, // Merges 'attendance_logs'
      ...communication.changes, // Merges 'notices', 'messages'
    },
    timestamp: Date.now(),
  };

  // 3. Audit Log
  const count =
    (attendance.changes.attendance_logs?.updated.length || 0) +
    (communication.changes.notices?.updated.length || 0) +
    (communication.changes.messages?.updated.length || 0);

  await db.insert(syncLogs).values({
    tenantId,
    userId,
    deviceId,
    syncType: "PULL",
    changesCount: count,
    durationMs: Date.now() - startTime,
    status: "SUCCESS",
  });

  return response;
}

// ==========================================
// PUSH (App -> Server)
// ==========================================

export async function processPushSync(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: SyncPushRequest,
  deviceId?: string
) {
  const db = drizzle(client);
  const startTime = Date.now();
  let changesCount = 0;

  try {
    // 1. Process Attendance Pushes
    if (data.changes.attendance_logs) {
      const { created, updated } = data.changes.attendance_logs;
      const logs = [...created, ...updated];

      for (const log of logs) {
        // Reuse the Domain Service to ensure validation & business rules apply
        // We might need to resolve 'academicYearId' from the log or context
        await markAttendance(client, tenantId, userId, log.academicYearId, {
          studentId: log.studentId,
          date: log.date,
          status: log.status,
          remarks: log.remarks,
          checkInTime: log.checkInTime,
        });
        changesCount++;
      }
    }

    // 2. Process Communication Pushes (if any)
    // Example: Sending a message while offline
    if (data.changes.messages) {
      // Logic to call communication services...
    }

    // 3. Audit Log
    await db.insert(syncLogs).values({
      tenantId,
      userId,
      deviceId,
      syncType: "PUSH",
      changesCount,
      durationMs: Date.now() - startTime,
      status: "SUCCESS",
    });
  } catch (error: any) {
    // Log Failure but preserve the error for API response
    await db.insert(syncLogs).values({
      tenantId,
      userId,
      deviceId,
      syncType: "PUSH",
      status: "FAILED",
      errorMessage: error.message,
      durationMs: Date.now() - startTime,
    });
    throw error;
  }
}

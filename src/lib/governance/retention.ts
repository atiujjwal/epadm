import "server-only";

import { and, eq, lt, sql } from "drizzle-orm";
import { auditLogs, notificationsQueue, privacyErasureRequests, students, studentInvoices, vehicleTrackingEvents } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const DATA_RETENTION_POLICY = {
  student_records: { years: 7, trigger: "student_leaving_date" },
  academic_results: { years: 7, trigger: "student_leaving_date" },
  attendance_records: { years: 5, trigger: "academic_year_end" },
  invoices: { years: 8, trigger: "invoice_date" },
  payment_transactions: { years: 8, trigger: "payment_date" },
  payroll_records: { years: 8, trigger: "pay_date" },
  staff_records: { years: 3, trigger: "leaving_date" },
  leave_records: { years: 3, trigger: "academic_year_end" },
  audit_logs: { years: 3, trigger: "event_date", immutable: true },
  health_records: { years: 7, trigger: "visit_date", elevated_delete: true },
  tracking_events: { days: 90, trigger: "event_date" },
  notifications_queue: { days: 30, trigger: "sent_at" },
  ai_generations: { years: 1, trigger: "created_at" },
} as const;

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function runRetentionJob(tenantId: string, actorUserId: string) {
  return withTenant(tenantId, async (tx) => {
    const trackingCutoff = daysAgo(DATA_RETENTION_POLICY.tracking_events.days);
    const notificationCutoff = daysAgo(DATA_RETENTION_POLICY.notifications_queue.days);

    const deletedTracking = await tx
      .delete(vehicleTrackingEvents)
      .where(and(eq(vehicleTrackingEvents.tenantId, tenantId), lt(vehicleTrackingEvents.recordedAt, trackingCutoff)))
      .returning({ id: vehicleTrackingEvents.id });

    const deletedNotifications = await tx
      .delete(notificationsQueue)
      .where(and(
        eq(notificationsQueue.tenantId, tenantId),
        sql`${notificationsQueue.status} in ('sent','failed','cancelled')`,
        lt(notificationsQueue.updatedAt, notificationCutoff),
      ))
      .returning({ id: notificationsQueue.id });

    await tx.insert(auditLogs).values({
      tenantId,
      actorUserId,
      action: "governance.retention.applied",
      entityType: "tenant",
      entityId: tenantId,
      metadata: {
        deletedTrackingEvents: deletedTracking.length,
        deletedNotifications: deletedNotifications.length,
        preservedFinancialRecords: true,
      },
    });

    return {
      deletedTrackingEvents: deletedTracking.length,
      deletedNotifications: deletedNotifications.length,
      preservedFinancialRecords: true,
    };
  });
}

export async function exportStudentPersonalData(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const [student] = await tx.select().from(students).where(and(eq(students.tenantId, tenantId), eq(students.id, studentId))).limit(1);
    if (!student) return null;
    const invoices = await tx.select().from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.studentId, studentId)));
    return { exportedAt: new Date().toISOString(), student, invoices };
  });
}

export async function submitErasureRequest(tenantId: string, userId: string, input: { studentId: string; reason: string }) {
  return withTenant(tenantId, async (tx) => {
    const [request] = await tx.insert(privacyErasureRequests).values({
      tenantId,
      studentId: input.studentId,
      requestedBy: userId,
      reason: input.reason,
      status: "pending",
    }).returning();
    await tx.insert(auditLogs).values({
      tenantId,
      actorUserId: userId,
      action: "governance.erasure.requested",
      entityType: "student",
      entityId: input.studentId,
      metadata: { requestId: request.id, reason: input.reason },
    });
    return request;
  });
}

export async function applyStudentErasure(tenantId: string, userId: string, requestId: string) {
  return withTenant(tenantId, async (tx) => {
    const [request] = await tx.select().from(privacyErasureRequests).where(and(eq(privacyErasureRequests.tenantId, tenantId), eq(privacyErasureRequests.id, requestId))).limit(1);
    if (!request) throw new Error("Erasure request not found");

    const [obligation] = await tx.select({
      balance: sql<number>`coalesce(sum(coalesce(${studentInvoices.balancePaise}, greatest(coalesce(${studentInvoices.totalPaise}, ${studentInvoices.amount} * 100) - ${studentInvoices.paidPaise}, 0))), 0)`,
    }).from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.studentId, request.studentId)));

    if ((obligation?.balance ?? 0) > 0) {
      throw new Error("Cannot erase student personal data while financial obligations remain unsettled.");
    }

    await tx.update(students).set({
      firstName: "Erased",
      lastName: "Student",
      guardianName: null,
      guardianPhone: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      state: null,
      pincode: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      photoUrl: null,
      notes: null,
      updatedAt: new Date(),
    }).where(and(eq(students.tenantId, tenantId), eq(students.id, request.studentId)));

    const [updated] = await tx.update(privacyErasureRequests).set({
      status: "applied",
      appliedBy: userId,
      appliedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(privacyErasureRequests.id, request.id)).returning();

    await tx.insert(auditLogs).values({
      tenantId,
      actorUserId: userId,
      action: "governance.erasure.applied",
      entityType: "student",
      entityId: request.studentId,
      metadata: { requestId: request.id, financialRecordsPreserved: true, academicRecordsPreserved: true },
    });

    return updated;
  });
}

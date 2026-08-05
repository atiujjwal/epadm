import "server-only";

import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import {
  aiGenerations,
  analyticsSnapshots,
  attendance,
  financialTransactions,
  payrollRuns,
  reportRuns,
  staffLeaveRequests,
  staffProfiles,
  studentEnrollments,
  studentInvoices,
  studentResults,
  students,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";

export class Phase12Error extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function phase12ApiError(error: unknown) {
  if (error instanceof Phase12Error) return Response.json({ error: error.message }, { status: error.status });
  console.error("[phase12]", error);
  return Response.json({ error: "Phase 12 request failed." }, { status: 500 });
}

export const SNAPSHOT_TTL_MINUTES = 60;

type SnapshotData = Record<string, unknown>;
type ComputeSnapshot = (tx: TenantTransaction) => Promise<SnapshotData>;

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

async function scalar(tx: TenantTransaction, query: Promise<Array<{ value: unknown }>>) {
  const [row] = await query;
  return numberValue(row?.value);
}

function snapshotWhere(tenantId: string, key: string, academicYearId?: string | null) {
  return and(
    eq(analyticsSnapshots.tenantId, tenantId),
    eq(analyticsSnapshots.snapshotKey, key),
    academicYearId ? eq(analyticsSnapshots.academicYearId, academicYearId) : isNull(analyticsSnapshots.academicYearId),
  );
}

export async function getOrRefreshSnapshot(
  tenantId: string,
  key: string,
  academicYearId: string | null,
  computeFn: ComputeSnapshot,
) {
  return withTenant(tenantId, async (tx) => {
    const [existing] = await tx
      .select()
      .from(analyticsSnapshots)
      .where(snapshotWhere(tenantId, key, academicYearId))
      .limit(1);

    if (existing && existing.validUntil.getTime() > Date.now()) {
      return existing.data;
    }

    const data = await computeFn(tx);
    const validUntil = new Date(Date.now() + SNAPSHOT_TTL_MINUTES * 60 * 1000);

    if (existing) {
      await tx
        .update(analyticsSnapshots)
        .set({ data, computedAt: new Date(), validUntil })
        .where(eq(analyticsSnapshots.id, existing.id));
    } else {
      await tx.insert(analyticsSnapshots).values({
        tenantId,
        snapshotKey: key,
        academicYearId,
        data,
        validUntil,
      });
    }

    return data;
  });
}

export async function refreshAnalyticsSnapshot(tenantId: string, key: string, academicYearId?: string | null) {
  const computeFn = SNAPSHOT_COMPUTERS[key];
  if (!computeFn) throw new Phase12Error("Unknown analytics snapshot key.", 404);

  return withTenant(tenantId, async (tx) => {
    const data = await computeFn(tenantId, tx);
    const validUntil = new Date(Date.now() + SNAPSHOT_TTL_MINUTES * 60 * 1000);
    const [existing] = await tx
      .select()
      .from(analyticsSnapshots)
      .where(snapshotWhere(tenantId, key, academicYearId ?? null))
      .limit(1);

    if (existing) {
      await tx.update(analyticsSnapshots).set({ data, computedAt: new Date(), validUntil }).where(eq(analyticsSnapshots.id, existing.id));
    } else {
      await tx.insert(analyticsSnapshots).values({ tenantId, snapshotKey: key, academicYearId: academicYearId ?? null, data, validUntil });
    }
    return data;
  });
}

async function computeAdminDashboard(tenantId: string, tx: TenantTransaction) {
  const [activeStudents, activeStaff, attendanceRows, reportCount, aiDrafts] = await Promise.all([
    scalar(tx, tx.select({ value: count() }).from(students).where(and(eq(students.tenantId, tenantId), eq(students.status, "active")))),
    scalar(tx, tx.select({ value: count() }).from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.status, "active")))),
    scalar(tx, tx.select({ value: count() }).from(attendance).where(eq(attendance.tenantId, tenantId))),
    scalar(tx, tx.select({ value: count() }).from(reportRuns).where(eq(reportRuns.tenantId, tenantId))),
    scalar(tx, tx.select({ value: count() }).from(aiGenerations).where(and(eq(aiGenerations.tenantId, tenantId), eq(aiGenerations.status, "draft")))),
  ]);

  const [finance] = await tx
    .select({
      invoicedPaise: sql<number>`coalesce(sum(coalesce(${studentInvoices.totalPaise}, (${studentInvoices.amount} * 100))), 0)`,
      collectedPaise: sql<number>`coalesce(sum(${studentInvoices.paidPaise}), 0)`,
      balancePaise: sql<number>`coalesce(sum(coalesce(${studentInvoices.balancePaise}, greatest(coalesce(${studentInvoices.totalPaise}, (${studentInvoices.amount} * 100)) - ${studentInvoices.paidPaise}, 0))), 0)`,
    })
    .from(studentInvoices)
    .where(eq(studentInvoices.tenantId, tenantId));

  return {
    activeStudents,
    activeStaff,
    attendanceRows,
    reportRuns: reportCount,
    aiDrafts,
    invoicedPaise: numberValue(finance?.invoicedPaise),
    collectedPaise: numberValue(finance?.collectedPaise),
    balancePaise: numberValue(finance?.balancePaise),
    computedAt: new Date().toISOString(),
  };
}

async function computeAcademicDashboard(tenantId: string, tx: TenantTransaction) {
  const [activeEnrollments, attendanceMarked, absentRows, publishedResults] = await Promise.all([
    scalar(tx, tx.select({ value: count() }).from(studentEnrollments).where(and(eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.enrollmentStatus, "active")))),
    scalar(tx, tx.select({ value: count() }).from(attendance).where(eq(attendance.tenantId, tenantId))),
    scalar(tx, tx.select({ value: count() }).from(attendance).where(and(eq(attendance.tenantId, tenantId), eq(attendance.status, "absent")))),
    scalar(tx, tx.select({ value: count() }).from(studentResults).where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.isPublished, true)))),
  ]);

  const attendanceRate = attendanceMarked ? Math.round(((attendanceMarked - absentRows) / attendanceMarked) * 1000) / 10 : 0;
  return { activeEnrollments, attendanceMarked, absentRows, attendanceRate, publishedResults, computedAt: new Date().toISOString() };
}

async function computeFinanceDashboard(tenantId: string, tx: TenantTransaction) {
  const [invoiceTotals] = await tx
    .select({
      invoicedPaise: sql<number>`coalesce(sum(coalesce(${studentInvoices.totalPaise}, (${studentInvoices.amount} * 100))), 0)`,
      collectedPaise: sql<number>`coalesce(sum(${studentInvoices.paidPaise}), 0)`,
      outstandingPaise: sql<number>`coalesce(sum(coalesce(${studentInvoices.balancePaise}, greatest(coalesce(${studentInvoices.totalPaise}, (${studentInvoices.amount} * 100)) - ${studentInvoices.paidPaise}, 0))), 0)`,
      overdueCount: sql<number>`coalesce(sum(case when ${studentInvoices.status} = 'overdue' then 1 else 0 end), 0)`,
    })
    .from(studentInvoices)
    .where(eq(studentInvoices.tenantId, tenantId));

  const [ledger] = await tx
    .select({
      incomePaise: sql<number>`coalesce(sum(case when ${financialTransactions.type} = 'credit' then coalesce(${financialTransactions.amountPaise}, ${financialTransactions.amount} * 100) else 0 end), 0)`,
      expensePaise: sql<number>`coalesce(sum(case when ${financialTransactions.type} = 'debit' then coalesce(${financialTransactions.amountPaise}, ${financialTransactions.amount} * 100) else 0 end), 0)`,
    })
    .from(financialTransactions)
    .where(eq(financialTransactions.tenantId, tenantId));

  return {
    invoicedPaise: numberValue(invoiceTotals?.invoicedPaise),
    collectedPaise: numberValue(invoiceTotals?.collectedPaise),
    outstandingPaise: numberValue(invoiceTotals?.outstandingPaise),
    overdueCount: numberValue(invoiceTotals?.overdueCount),
    incomePaise: numberValue(ledger?.incomePaise),
    expensePaise: numberValue(ledger?.expensePaise),
    computedAt: new Date().toISOString(),
  };
}

async function computeHrDashboard(tenantId: string, tx: TenantTransaction) {
  const [activeStaff, pendingLeaves, lockedRuns] = await Promise.all([
    scalar(tx, tx.select({ value: count() }).from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.status, "active")))),
    scalar(tx, tx.select({ value: count() }).from(staffLeaveRequests).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.status, "pending")))),
    scalar(tx, tx.select({ value: count() }).from(payrollRuns).where(and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.status, "locked")))),
  ]);

  const [payroll] = await tx
    .select({ netPaise: sql<number>`coalesce(sum(${payrollRuns.totalNetPaise}), 0)` })
    .from(payrollRuns)
    .where(eq(payrollRuns.tenantId, tenantId));

  return { activeStaff, pendingLeaves, lockedRuns, payrollNetPaise: numberValue(payroll?.netPaise), computedAt: new Date().toISOString() };
}

export async function computeDataQuality(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [missingGuardianPhones, unassignedEnrollments, overdueInvoices, aiDrafts] = await Promise.all([
      scalar(tx, tx.select({ value: count() }).from(students).where(and(eq(students.tenantId, tenantId), sql`${students.guardianPhone} is null or length(trim(${students.guardianPhone})) = 0`))),
      scalar(tx, tx.select({ value: count() }).from(studentEnrollments).where(and(eq(studentEnrollments.tenantId, tenantId), isNull(studentEnrollments.sectionId)))),
      scalar(tx, tx.select({ value: count() }).from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.status, "overdue")))),
      scalar(tx, tx.select({ value: count() }).from(aiGenerations).where(and(eq(aiGenerations.tenantId, tenantId), eq(aiGenerations.status, "draft")))),
    ]);

    return [
      { key: "students.missing_guardian_phone", label: "Students missing guardian phone", severity: missingGuardianPhones ? "warn" : "ok", count: missingGuardianPhones, owner: "Administration" },
      { key: "academics.unassigned_section", label: "Active enrollments without a section", severity: unassignedEnrollments ? "warn" : "ok", count: unassignedEnrollments, owner: "Academics" },
      { key: "finance.overdue_invoices", label: "Overdue invoices needing follow-up", severity: overdueInvoices ? "critical" : "ok", count: overdueInvoices, owner: "Finance" },
      { key: "ai.pending_review", label: "AI drafts awaiting human review", severity: aiDrafts ? "info" : "ok", count: aiDrafts, owner: "AI Governance" },
    ];
  });
}

const SNAPSHOT_COMPUTERS: Record<string, (tenantId: string, tx: TenantTransaction) => Promise<SnapshotData>> = {
  admin_dashboard: computeAdminDashboard,
  academic_dashboard: computeAcademicDashboard,
  finance_dashboard: computeFinanceDashboard,
  hr_dashboard: computeHrDashboard,
};

export async function getAnalyticsDashboard(tenantId: string) {
  const [admin, academic, finance, hr, recentReports] = await Promise.all([
    getOrRefreshSnapshot(tenantId, "admin_dashboard", null, (tx) => computeAdminDashboard(tenantId, tx)),
    getOrRefreshSnapshot(tenantId, "academic_dashboard", null, (tx) => computeAcademicDashboard(tenantId, tx)),
    getOrRefreshSnapshot(tenantId, "finance_dashboard", null, (tx) => computeFinanceDashboard(tenantId, tx)),
    getOrRefreshSnapshot(tenantId, "hr_dashboard", null, (tx) => computeHrDashboard(tenantId, tx)),
    withTenant(tenantId, (tx) => tx.select().from(reportRuns).where(eq(reportRuns.tenantId, tenantId)).orderBy(desc(reportRuns.createdAt)).limit(5)),
  ]);

  return { admin, academic, finance, hr, recentReports };
}

export async function getRoleAnalytics(tenantId: string, area: "academic" | "finance" | "hr") {
  const key = `${area}_dashboard`;
  const computeFn = SNAPSHOT_COMPUTERS[key];
  if (!computeFn) throw new Phase12Error("Unknown analytics area.", 404);
  return getOrRefreshSnapshot(tenantId, key, null, (tx) => computeFn(tenantId, tx));
}

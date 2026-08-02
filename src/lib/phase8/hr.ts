import "server-only";

import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import {
  academicYears,
  auditLogs,
  performanceCycles,
  performanceReviews,
  recruitmentApplications,
  recruitmentInterviews,
  recruitmentOffers,
  recruitmentPostings,
  staffContracts,
  staffDepartments,
  staffLeaveBalances,
  staffLeaveRequests,
  staffLeaveTypes,
  staffProfiles,
  tenantUsers,
} from "@/lib/db";
import { Phase8Error } from "@/lib/phase8/payroll";
import { type TenantTransaction, withTenant } from "@/lib/rls";

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

const DEFAULT_LEAVE_TYPES = [
  { code: "CL", name: "Casual Leave", annualAllowanceDays: "12.00", requiresL2: false },
  { code: "SL", name: "Sick Leave", annualAllowanceDays: "10.00", requiresL2: false },
  { code: "EL", name: "Earned Leave", annualAllowanceDays: "15.00", requiresL2: true },
  { code: "ML", name: "Maternity Leave", annualAllowanceDays: "180.00", requiresL2: true },
] as const;

export async function ensureHrDefaults(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    for (const leaveType of DEFAULT_LEAVE_TYPES) {
      await tx.insert(staffLeaveTypes).values({ tenantId, ...leaveType }).onConflictDoUpdate({
        target: [staffLeaveTypes.tenantId, staffLeaveTypes.code],
        set: { name: leaveType.name, annualAllowanceDays: leaveType.annualAllowanceDays, requiresL2: leaveType.requiresL2, isActive: true },
      });
    }
    return { seeded: true };
  });
}

export async function listHrPhase8Model(tenantId: string) {
  await ensureHrDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [contracts, postings, applications, interviews, offers, cycles, reviews, leaveTypes, leaveBalances, leaveRequests, years, staff] = await Promise.all([
      tx.select({ id: staffContracts.id, staffId: staffContracts.staffId, title: staffContracts.title, contractType: staffContracts.contractType, startDate: staffContracts.startDate, endDate: staffContracts.endDate, grossSalaryPaise: staffContracts.grossSalaryPaise, basicSalaryPaise: staffContracts.basicSalaryPaise, status: staffContracts.status, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode }).from(staffContracts).innerJoin(staffProfiles, eq(staffProfiles.id, staffContracts.staffId)).where(eq(staffContracts.tenantId, tenantId)).orderBy(desc(staffContracts.startDate)),
      tx.select().from(recruitmentPostings).where(eq(recruitmentPostings.tenantId, tenantId)).orderBy(desc(recruitmentPostings.createdAt)),
      tx.select({ id: recruitmentApplications.id, postingId: recruitmentApplications.postingId, candidateName: recruitmentApplications.candidateName, candidateEmail: recruitmentApplications.candidateEmail, stage: recruitmentApplications.stage, expectedCtcPaise: recruitmentApplications.expectedCtcPaise, createdAt: recruitmentApplications.createdAt, postingTitle: recruitmentPostings.title }).from(recruitmentApplications).innerJoin(recruitmentPostings, eq(recruitmentPostings.id, recruitmentApplications.postingId)).where(eq(recruitmentApplications.tenantId, tenantId)).orderBy(desc(recruitmentApplications.createdAt)),
      tx.select().from(recruitmentInterviews).where(eq(recruitmentInterviews.tenantId, tenantId)).orderBy(desc(recruitmentInterviews.scheduledAt)),
      tx.select().from(recruitmentOffers).where(eq(recruitmentOffers.tenantId, tenantId)).orderBy(desc(recruitmentOffers.createdAt)),
      tx.select().from(performanceCycles).where(eq(performanceCycles.tenantId, tenantId)).orderBy(desc(performanceCycles.createdAt)),
      tx.select({ id: performanceReviews.id, cycleId: performanceReviews.cycleId, staffId: performanceReviews.staffId, reviewerUserId: performanceReviews.reviewerUserId, status: performanceReviews.status, overallRating: performanceReviews.overallRating, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode }).from(performanceReviews).innerJoin(staffProfiles, eq(staffProfiles.id, performanceReviews.staffId)).where(eq(performanceReviews.tenantId, tenantId)).orderBy(desc(performanceReviews.createdAt)),
      tx.select().from(staffLeaveTypes).where(eq(staffLeaveTypes.tenantId, tenantId)).orderBy(asc(staffLeaveTypes.code)),
      tx.select().from(staffLeaveBalances).where(eq(staffLeaveBalances.tenantId, tenantId)),
      tx.select({ id: staffLeaveRequests.id, staffId: staffLeaveRequests.staffId, leaveTypeId: staffLeaveRequests.leaveTypeId, fromDate: staffLeaveRequests.fromDate, toDate: staffLeaveRequests.toDate, days: staffLeaveRequests.days, reason: staffLeaveRequests.reason, status: staffLeaveRequests.status, requiresL2: staffLeaveRequests.requiresL2, approverL1: staffLeaveRequests.approverL1, approverL2: staffLeaveRequests.approverL2, rejectionNote: staffLeaveRequests.rejectionNote, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode }).from(staffLeaveRequests).innerJoin(staffProfiles, eq(staffProfiles.id, staffLeaveRequests.staffId)).where(eq(staffLeaveRequests.tenantId, tenantId)).orderBy(desc(staffLeaveRequests.createdAt)),
      tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.startDate)),
      tx.select().from(staffProfiles).where(eq(staffProfiles.tenantId, tenantId)).orderBy(asc(staffProfiles.fullName)),
    ]);
    return { contracts, postings, applications, interviews, offers, cycles, reviews, leaveTypes, leaveBalances, leaveRequests, years, staff };
  });
}

export async function createStaffContract(tenantId: string, actorUserId: string, input: Omit<typeof staffContracts.$inferInsert, "id" | "tenantId" | "createdAt" | "updatedAt" | "createdBy">) {
  return withTenant(tenantId, async (tx) => {
    const [staff] = await tx.select({ id: staffProfiles.id }).from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, input.staffId))).limit(1);
    if (!staff) throw new Phase8Error("Staff member not found.", 404);
    const [contract] = await tx.insert(staffContracts).values({ ...input, tenantId, createdBy: actorUserId }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hr.contract.created", entityType: "staff_contract", entityId: contract.id, metadata: { staffId: input.staffId } });
    return contract;
  });
}

export async function listStaffContracts(tenantId: string, staffId?: string) {
  return withTenant(tenantId, (tx) => tx.select().from(staffContracts).where(and(eq(staffContracts.tenantId, tenantId), staffId ? eq(staffContracts.staffId, staffId) : undefined)).orderBy(desc(staffContracts.startDate)));
}

export async function createRecruitmentPosting(tenantId: string, actorUserId: string, input: { title: string; description?: string | null; departmentId?: string | null; employmentType?: string; openings?: number; salaryRangeMinPaise?: number | null; salaryRangeMaxPaise?: number | null; closesOn?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [posting] = await tx.insert(recruitmentPostings).values({ tenantId, createdBy: actorUserId, status: "open", postedAt: new Date(), title: input.title.trim(), description: input.description ?? null, departmentId: input.departmentId ?? null, employmentType: input.employmentType ?? "full_time", openings: input.openings ?? 1, salaryRangeMinPaise: input.salaryRangeMinPaise ?? null, salaryRangeMaxPaise: input.salaryRangeMaxPaise ?? null, closesOn: input.closesOn ?? null }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hr.recruitment.posting.created", entityType: "recruitment_posting", entityId: posting.id });
    return posting;
  });
}

export async function createRecruitmentApplication(tenantId: string, input: { postingId: string; candidateName: string; candidateEmail?: string | null; candidatePhone?: string | null; resumeUrl?: string | null; currentCtcPaise?: number | null; expectedCtcPaise?: number | null; source?: string | null; notes?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [posting] = await tx.select({ id: recruitmentPostings.id }).from(recruitmentPostings).where(and(eq(recruitmentPostings.tenantId, tenantId), eq(recruitmentPostings.id, input.postingId))).limit(1);
    if (!posting) throw new Phase8Error("Recruitment posting not found.", 404);
    const [application] = await tx.insert(recruitmentApplications).values({ tenantId, ...input, candidateName: input.candidateName.trim() }).returning();
    return application;
  });
}

export async function updateRecruitmentApplicationStage(tenantId: string, applicationId: string, stage: string) {
  return withTenant(tenantId, async (tx) => {
    const [application] = await tx.update(recruitmentApplications).set({ stage, updatedAt: new Date() }).where(and(eq(recruitmentApplications.tenantId, tenantId), eq(recruitmentApplications.id, applicationId))).returning();
    if (!application) throw new Phase8Error("Recruitment application not found.", 404);
    return application;
  });
}

export async function scheduleRecruitmentInterview(tenantId: string, input: { applicationId: string; scheduledAt: string; interviewerUserId?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [interview] = await tx.insert(recruitmentInterviews).values({ tenantId, applicationId: input.applicationId, scheduledAt: new Date(input.scheduledAt), interviewerUserId: input.interviewerUserId ?? null }).returning();
    await tx.update(recruitmentApplications).set({ stage: "interview", updatedAt: new Date() }).where(and(eq(recruitmentApplications.tenantId, tenantId), eq(recruitmentApplications.id, input.applicationId)));
    return interview;
  });
}

export async function createRecruitmentOffer(tenantId: string, actorUserId: string, input: { applicationId: string; offeredRole: string; offeredCtcPaise: number; joiningDate?: string | null; documentUrl?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [offer] = await tx.insert(recruitmentOffers).values({ tenantId, createdBy: actorUserId, ...input, documentUrl: input.documentUrl ?? null }).onConflictDoUpdate({
      target: recruitmentOffers.applicationId,
      set: { offeredRole: input.offeredRole, offeredCtcPaise: input.offeredCtcPaise, joiningDate: input.joiningDate ?? null, documentUrl: input.documentUrl ?? null, status: "offered", updatedAt: new Date() },
    }).returning();
    await tx.update(recruitmentApplications).set({ stage: "offer", updatedAt: new Date() }).where(and(eq(recruitmentApplications.tenantId, tenantId), eq(recruitmentApplications.id, input.applicationId)));
    return offer;
  });
}

export async function hireRecruitmentApplication(tenantId: string, actorUserId: string, applicationId: string, input: { employeeCode: string; joinedOn?: string | null; departmentId?: string | null; staffType?: string; employmentType?: string }) {
  return withTenant(tenantId, async (tx) => {
    const [application] = await tx.select().from(recruitmentApplications).where(and(eq(recruitmentApplications.tenantId, tenantId), eq(recruitmentApplications.id, applicationId))).limit(1);
    if (!application) throw new Phase8Error("Recruitment application not found.", 404);
    if (application.hiredStaffId) return { staffId: application.hiredStaffId, alreadyHired: true };
    const [staff] = await tx.insert(staffProfiles).values({
      tenantId,
      employeeCode: input.employeeCode.trim().toUpperCase(),
      fullName: application.candidateName,
      email: application.candidateEmail,
      phone: application.candidatePhone,
      departmentId: input.departmentId ?? null,
      jobTitle: "New Hire",
      employmentType: input.employmentType ?? "full_time",
      joinedOn: input.joinedOn ?? new Date().toISOString().slice(0, 10),
      staffType: input.staffType ?? "teaching",
      status: "active",
    }).returning();
    await tx.update(recruitmentApplications).set({ stage: "hired", hiredStaffId: staff.id, updatedAt: new Date() }).where(and(eq(recruitmentApplications.tenantId, tenantId), eq(recruitmentApplications.id, applicationId)));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hr.recruitment.hired", entityType: "staff_profile", entityId: staff.id, metadata: { applicationId } });
    return { staffId: staff.id, alreadyHired: false };
  });
}

export async function createPerformanceCycle(tenantId: string, actorUserId: string, input: { name: string; academicYearId?: string | null; reviewPeriodStart: string; reviewPeriodEnd: string }) {
  return withTenant(tenantId, async (tx) => {
    const [cycle] = await tx.insert(performanceCycles).values({ tenantId, createdBy: actorUserId, name: input.name.trim(), academicYearId: input.academicYearId ?? null, reviewPeriodStart: input.reviewPeriodStart, reviewPeriodEnd: input.reviewPeriodEnd }).returning();
    return cycle;
  });
}

export async function generatePerformanceReviews(tenantId: string, cycleId: string) {
  return withTenant(tenantId, async (tx) => {
    const [cycle] = await tx.select().from(performanceCycles).where(and(eq(performanceCycles.tenantId, tenantId), eq(performanceCycles.id, cycleId))).limit(1);
    if (!cycle) throw new Phase8Error("Performance cycle not found.", 404);
    const staffRows = await tx.select().from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.status, "active")));
    let created = 0;
    for (const staff of staffRows) {
      const reviewer = staff.departmentId
        ? await tx.select({ userId: tenantUsers.userId }).from(staffDepartments).innerJoin(staffProfiles, eq(staffProfiles.id, staffDepartments.headStaffId)).leftJoin(tenantUsers, eq(tenantUsers.id, staffProfiles.tenantUserId)).where(and(eq(staffDepartments.tenantId, tenantId), eq(staffDepartments.id, staff.departmentId))).limit(1)
        : [];
      const rows = await tx.insert(performanceReviews).values({ tenantId, cycleId, staffId: staff.id, reviewerUserId: reviewer[0]?.userId ?? null }).onConflictDoNothing({ target: [performanceReviews.cycleId, performanceReviews.staffId] }).returning();
      created += rows.length;
    }
    await tx.update(performanceCycles).set({ status: "active", updatedAt: new Date() }).where(and(eq(performanceCycles.tenantId, tenantId), eq(performanceCycles.id, cycleId)));
    return { created, skipped: staffRows.length - created };
  });
}

export async function submitSelfAssessment(tenantId: string, staffId: string, reviewId: string, selfAssessment: Record<string, unknown>) {
  return withTenant(tenantId, async (tx) => {
    const [review] = await tx.update(performanceReviews).set({ selfAssessment, status: "pending_reviewer", updatedAt: new Date() }).where(and(eq(performanceReviews.tenantId, tenantId), eq(performanceReviews.id, reviewId), eq(performanceReviews.staffId, staffId))).returning();
    if (!review) throw new Phase8Error("Performance review not found for this staff member.", 404);
    return review;
  });
}

export async function submitReviewerAssessment(tenantId: string, reviewerUserId: string, reviewId: string, input: { reviewerComments?: string | null; dimensionRatings?: Record<string, number>; overallRating?: string | number | null }) {
  return withTenant(tenantId, async (tx) => {
    const [review] = await tx.update(performanceReviews).set({ reviewerComments: input.reviewerComments ?? null, dimensionRatings: input.dimensionRatings ?? {}, overallRating: input.overallRating == null ? null : String(input.overallRating), status: "pending_acknowledgment", updatedAt: new Date() }).where(and(eq(performanceReviews.tenantId, tenantId), eq(performanceReviews.id, reviewId), eq(performanceReviews.reviewerUserId, reviewerUserId))).returning();
    if (!review) throw new Phase8Error("Only the assigned reviewer can submit this review.", 403);
    return review;
  });
}

export async function acknowledgePerformanceReview(tenantId: string, staffId: string, reviewId: string) {
  return withTenant(tenantId, async (tx) => {
    const [review] = await tx.update(performanceReviews).set({ status: "acknowledged", acknowledgedAt: new Date(), updatedAt: new Date() }).where(and(eq(performanceReviews.tenantId, tenantId), eq(performanceReviews.id, reviewId), eq(performanceReviews.staffId, staffId))).returning();
    if (!review) throw new Phase8Error("Performance review not found for this staff member.", 404);
    return review;
  });
}

function inclusiveDays(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00Z`);
  const to = new Date(`${toDate}T00:00:00Z`);
  return Math.max(Math.floor((to.getTime() - from.getTime()) / 86400000) + 1, 1);
}

async function resolveApprovers(tx: TenantTransaction, tenantId: string, staffId: string) {
  const [staff] = await tx.select().from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId))).limit(1);
  if (!staff) throw new Phase8Error("Staff member not found.", 404);
  const l1 = staff.departmentId
    ? await tx.select({ userId: tenantUsers.userId }).from(staffDepartments).innerJoin(staffProfiles, eq(staffProfiles.id, staffDepartments.headStaffId)).leftJoin(tenantUsers, eq(tenantUsers.id, staffProfiles.tenantUserId)).where(and(eq(staffDepartments.tenantId, tenantId), eq(staffDepartments.id, staff.departmentId))).limit(1)
    : [];
  const l2 = await tx.select({ userId: tenantUsers.userId }).from(tenantUsers).where(and(eq(tenantUsers.tenantId, tenantId), or(eq(tenantUsers.role, "admin"), eq(tenantUsers.role, "hr")))).limit(1);
  return { staff, approverL1: l1[0]?.userId ?? l2[0]?.userId ?? null, approverL2: l2[0]?.userId ?? null };
}

async function getStaffUserId(tx: TenantTransaction, tenantId: string, staffId: string) {
  const [staffUser] = await tx.select({ userId: tenantUsers.userId }).from(staffProfiles).leftJoin(tenantUsers, eq(tenantUsers.id, staffProfiles.tenantUserId)).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId))).limit(1);
  return staffUser?.userId ?? null;
}

export async function createStaffLeaveRequest(tenantId: string, actorUserId: string, input: { staffId: string; leaveTypeId: string; fromDate: string; toDate: string; reason?: string | null }) {
  await ensureHrDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [leaveType] = await tx.select().from(staffLeaveTypes).where(and(eq(staffLeaveTypes.tenantId, tenantId), eq(staffLeaveTypes.id, input.leaveTypeId))).limit(1);
    if (!leaveType) throw new Phase8Error("Leave type not found.", 404);
    const days = inclusiveDays(input.fromDate, input.toDate);
    const requiresL2 = leaveType.requiresL2 || days > Number(leaveType.l2ThresholdDays);
    const approvers = await resolveApprovers(tx, tenantId, input.staffId);
    const [request] = await tx.insert(staffLeaveRequests).values({ tenantId, staffId: input.staffId, leaveTypeId: input.leaveTypeId, fromDate: input.fromDate, toDate: input.toDate, days: String(days), reason: input.reason ?? null, requiresL2, approverL1: approvers.approverL1, approverL2: requiresL2 ? approvers.approverL2 : null, createdBy: actorUserId }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "hr.leave.requested", entityType: "staff_leave_request", entityId: request.id });
    return request;
  });
}

async function applyApprovedLeaveBalance(tx: TenantTransaction, tenantId: string, request: typeof staffLeaveRequests.$inferSelect) {
  const [balance] = await tx.select().from(staffLeaveBalances).where(and(eq(staffLeaveBalances.tenantId, tenantId), eq(staffLeaveBalances.staffId, request.staffId), eq(staffLeaveBalances.leaveTypeId, request.leaveTypeId))).limit(1);
  if (balance) {
    const used = Number(balance.usedDays) + Number(request.days);
    const credited = Number(balance.creditedDays);
    await tx.update(staffLeaveBalances).set({ usedDays: String(used), balanceDays: String(Math.max(credited - used, 0)), updatedAt: new Date() }).where(and(eq(staffLeaveBalances.tenantId, tenantId), eq(staffLeaveBalances.id, balance.id)));
  }
}

export async function approveLeaveL1(tenantId: string, actorUserId: string, requestId: string) {
  return withTenant(tenantId, async (tx) => {
    const [current] = await tx.select().from(staffLeaveRequests).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.id, requestId))).limit(1);
    if (!current) throw new Phase8Error("Leave request not found.", 404);
    if ((await getStaffUserId(tx, tenantId, current.staffId)) === actorUserId) throw new Phase8Error("Staff cannot approve their own leave.", 403);
    if (current.approverL1 !== actorUserId) throw new Phase8Error("Only the L1 approver can approve this leave.", 403);
    const nextStatus = current.requiresL2 ? "l1_approved" : "approved";
    const [request] = await tx.update(staffLeaveRequests).set({ status: nextStatus, l1ApprovedBy: actorUserId, l1ApprovedAt: new Date(), updatedAt: new Date() }).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.id, requestId), eq(staffLeaveRequests.status, "pending"))).returning();
    if (!request) throw new Phase8Error("Leave request is not pending L1 approval.", 422);
    if (nextStatus === "approved") await applyApprovedLeaveBalance(tx, tenantId, request);
    return request;
  });
}

export async function approveLeaveL2(tenantId: string, actorUserId: string, requestId: string) {
  return withTenant(tenantId, async (tx) => {
    const [current] = await tx.select().from(staffLeaveRequests).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.id, requestId))).limit(1);
    if (!current) throw new Phase8Error("Leave request not found.", 404);
    if ((await getStaffUserId(tx, tenantId, current.staffId)) === actorUserId) throw new Phase8Error("Staff cannot approve their own leave.", 403);
    if (current.approverL2 !== actorUserId) throw new Phase8Error("Only the L2 approver can approve this leave.", 403);
    const [request] = await tx.update(staffLeaveRequests).set({ status: "approved", l2ApprovedBy: actorUserId, l2ApprovedAt: new Date(), updatedAt: new Date() }).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.id, requestId), eq(staffLeaveRequests.status, "l1_approved"))).returning();
    if (!request) throw new Phase8Error("Leave request is not pending L2 approval.", 422);
    await applyApprovedLeaveBalance(tx, tenantId, request);
    return request;
  });
}

export async function rejectLeaveRequest(tenantId: string, actorUserId: string, requestId: string, rejectionNote: string) {
  return withTenant(tenantId, async (tx) => {
    const [current] = await tx.select().from(staffLeaveRequests).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.id, requestId))).limit(1);
    if (!current) throw new Phase8Error("Leave request not found.", 404);
    if ((await getStaffUserId(tx, tenantId, current.staffId)) === actorUserId) throw new Phase8Error("Staff cannot reject their own leave.", 403);
    if (![current.approverL1, current.approverL2].includes(actorUserId)) throw new Phase8Error("Only an assigned approver can reject this leave.", 403);
    const [request] = await tx.update(staffLeaveRequests).set({ status: "rejected", rejectedBy: actorUserId, rejectedAt: new Date(), rejectionNote, updatedAt: new Date() }).where(and(eq(staffLeaveRequests.tenantId, tenantId), eq(staffLeaveRequests.id, requestId))).returning();
    return request;
  });
}

export async function getPendingApprovals(tenantId: string, userId: string) {
  return withTenant(tenantId, async (tx) => {
    const leave = await tx.select({ id: staffLeaveRequests.id, staffId: staffLeaveRequests.staffId, fromDate: staffLeaveRequests.fromDate, toDate: staffLeaveRequests.toDate, days: staffLeaveRequests.days, reason: staffLeaveRequests.reason, status: staffLeaveRequests.status, staffName: staffProfiles.fullName, employeeCode: staffProfiles.employeeCode, approvalLevel: sql<string>`case when ${staffLeaveRequests.status} = 'pending' then 'L1' else 'L2' end` }).from(staffLeaveRequests)
      .innerJoin(staffProfiles, eq(staffProfiles.id, staffLeaveRequests.staffId))
      .where(and(eq(staffLeaveRequests.tenantId, tenantId), or(and(eq(staffLeaveRequests.approverL1, userId), eq(staffLeaveRequests.status, "pending")), and(eq(staffLeaveRequests.approverL2, userId), eq(staffLeaveRequests.status, "l1_approved")))))
      .orderBy(asc(staffLeaveRequests.fromDate));
    return { leave, count: leave.length };
  });
}

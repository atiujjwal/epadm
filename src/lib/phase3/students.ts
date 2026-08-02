import "server-only";

import { and, asc, count, desc, eq, ilike, isNull, ne, or, sql } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import {
  academicClasses, academicYears, classSections, guardianProfiles, studentDocuments,
  studentEnrollments, studentGuardians, studentInvoices, studentNotes, students,
  studentStatusHistory, tenantUsers, type GuardianRelationship, type StudentNoteCategory, type UserRole,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";

type StudentFilters = { q?: string; classId?: string; sectionId?: string; status?: string; gender?: string; page?: number; limit?: number };

export async function assertStudentAccess(tenantId: string, userId: string, role: UserRole, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const student = await tx.query.students.findFirst({ where: and(eq(students.tenantId, tenantId), eq(students.id, studentId)) });
    if (!student) throw new Error("Student not found");
    if (role === "parent") {
      const [linked] = await tx.select({ id: studentGuardians.id }).from(studentGuardians)
        .innerJoin(guardianProfiles, eq(studentGuardians.guardianId, guardianProfiles.id))
        .where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.studentId, studentId), eq(guardianProfiles.userId, userId))).limit(1);
      if (!linked) throw new Error("FORBIDDEN: Student is not linked to this parent account");
    }
    if (role === "student") {
      if (!student.tenantUserId) throw new Error("FORBIDDEN: Student profile access denied");
      const membership = await tx.query.tenantUsers.findFirst({ where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.id, student.tenantUserId), eq(tenantUsers.userId, userId)) });
      if (!membership) throw new Error("FORBIDDEN: Student profile access denied");
    }
    return student;
  });
}

export async function listStudentDirectory(tenantId: string, filters: StudentFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1); const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);
  return withTenant(tenantId, async (tx) => {
    const where = and(
      eq(students.tenantId, tenantId),
      filters.q ? or(ilike(students.firstName, `%${filters.q}%`), ilike(students.lastName, `%${filters.q}%`), ilike(students.admissionNumber, `%${filters.q}%`), ilike(studentEnrollments.rollNumber, `%${filters.q}%`)) : undefined,
      filters.status ? eq(students.status, filters.status) : undefined,
      filters.gender ? eq(students.gender, filters.gender) : undefined,
      filters.classId ? eq(studentEnrollments.classId, filters.classId) : undefined,
      filters.sectionId ? eq(studentEnrollments.sectionId, filters.sectionId) : undefined,
    );
    const rows = await tx.select({
      id: students.id, admissionNumber: students.admissionNumber, firstName: students.firstName,
      lastName: students.lastName, photoUrl: students.photoUrl, gender: students.gender,
      status: students.status, className: academicClasses.name, sectionName: classSections.name,
      rollNumber: studentEnrollments.rollNumber,
      guardianName: sql<string | null>`coalesce(${guardianProfiles.firstName} || ' ' || ${guardianProfiles.lastName}, ${students.guardianName})`,
    }).from(students)
      .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.status, "active")))
      .leftJoin(academicClasses, eq(studentEnrollments.classId, academicClasses.id))
      .leftJoin(classSections, eq(studentEnrollments.sectionId, classSections.id))
      .leftJoin(studentGuardians, and(eq(studentGuardians.studentId, students.id), eq(studentGuardians.isPrimary, true)))
      .leftJoin(guardianProfiles, eq(studentGuardians.guardianId, guardianProfiles.id))
      .where(where).orderBy(asc(students.firstName), asc(students.lastName)).limit(limit).offset((page - 1) * limit);
    const [totalRow] = await tx.select({ count: count() }).from(students)
      .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.status, "active")))
      .where(and(eq(students.tenantId, tenantId), filters.q ? or(ilike(students.firstName, `%${filters.q}%`), ilike(students.lastName, `%${filters.q}%`), ilike(students.admissionNumber, `%${filters.q}%`), ilike(studentEnrollments.rollNumber, `%${filters.q}%`)) : undefined, filters.status ? eq(students.status, filters.status) : undefined, filters.gender ? eq(students.gender, filters.gender) : undefined, filters.classId ? eq(studentEnrollments.classId, filters.classId) : undefined, filters.sectionId ? eq(studentEnrollments.sectionId, filters.sectionId) : undefined));
    return { students: rows, total: Number(totalRow?.count ?? 0), page, limit };
  });
}

export type StudentProfileInput = Partial<typeof students.$inferInsert> & {
  firstName: string; admissionNumber: string; classId?: string; sectionId?: string; academicYear?: string; rollNumber?: string;
  guardian?: { firstName: string; lastName: string; phonePrimary?: string; relationship: GuardianRelationship };
};

export async function createStudent360(tenantId: string, actorUserId: string, input: StudentProfileInput) {
  return withTenant(tenantId, async (tx) => {
    const admissionNumber = input.admissionNumber.trim().toUpperCase();
    const duplicate = await tx.query.students.findFirst({ where: and(eq(students.tenantId, tenantId), eq(students.admissionNumber, admissionNumber)) });
    if (duplicate) throw new Error("A student with this admission number already exists");
    const { classId, sectionId, academicYear, rollNumber, guardian, ...profile } = input;
    const [student] = await tx.insert(students).values({ ...profile, tenantId, admissionNumber, firstName: input.firstName.trim(), lastName: input.lastName?.trim() || null }).returning();
    if (classId && academicYear) await tx.insert(studentEnrollments).values({ tenantId, studentId: student.id, classId, sectionId: sectionId || null, academicYear, rollNumber: rollNumber || null, status: "active", enrolledOn: input.admissionDate || new Date().toISOString().slice(0, 10) });
    if (guardian) {
      const [person] = await tx.insert(guardianProfiles).values({ tenantId, firstName: guardian.firstName.trim(), lastName: guardian.lastName.trim(), phonePrimary: guardian.phonePrimary?.trim() || null }).returning();
      await tx.insert(studentGuardians).values({ tenantId, studentId: student.id, guardianId: person.id, relationship: guardian.relationship, isPrimary: true });
    }
    await writeAuditLog(tx, { tenantId, actorUserId, action: "student.created", entityType: "student", entityId: student.id, metadata: { admissionNumber } });
    return student;
  });
}

export async function getStudent360(tenantId: string, studentId: string, role: UserRole) {
  return withTenant(tenantId, async (tx) => {
    const student = await tx.query.students.findFirst({ where: and(eq(students.tenantId, tenantId), eq(students.id, studentId)) });
    if (!student) return null;
    const enrollments = await tx.select({ id: studentEnrollments.id, academicYear: studentEnrollments.academicYear, rollNumber: studentEnrollments.rollNumber, status: studentEnrollments.status, enrolledOn: studentEnrollments.enrolledOn, className: academicClasses.name, sectionName: classSections.name }).from(studentEnrollments).innerJoin(academicClasses, eq(studentEnrollments.classId, academicClasses.id)).leftJoin(classSections, eq(studentEnrollments.sectionId, classSections.id)).where(and(eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.studentId, studentId))).orderBy(desc(studentEnrollments.createdAt));
    const guardians = await listStudentGuardiansTx(tx, tenantId, studentId);
    const history = await tx.select().from(studentStatusHistory).where(and(eq(studentStatusHistory.tenantId, tenantId), eq(studentStatusHistory.studentId, studentId))).orderBy(desc(studentStatusHistory.changedAt)).limit(10);
    const [fees] = await tx.select({ outstanding: sql<number>`coalesce(sum(${studentInvoices.amount}) filter (where ${studentInvoices.status} <> 'paid'), 0)` }).from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.studentId, studentId)));
    const safeStudent = role === "admin" || role === "superadmin" ? student : { ...student, category: null, religion: null, bloodGroup: null };
    const canViewFees = ["admin", "superadmin", "parent", "accountant"].includes(role);
    return { student: safeStudent, enrollments, guardians, statusHistory: history, outstandingFees: canViewFees ? Number(fees?.outstanding ?? 0) : null };
  });
}

export async function updateStudent360(tenantId: string, actorUserId: string, studentId: string, input: Partial<typeof students.$inferInsert>) {
  return withTenant(tenantId, async (tx) => {
    const safe = { ...input };
    delete safe.id;
    delete safe.tenantId;
    delete safe.createdAt;
    const [student] = await tx.update(students).set({ ...safe, updatedAt: new Date() }).where(and(eq(students.tenantId, tenantId), eq(students.id, studentId))).returning();
    if (!student) throw new Error("Student not found");
    await writeAuditLog(tx, { tenantId, actorUserId, action: "student.updated", entityType: "student", entityId: studentId, metadata: { fields: Object.keys(safe) } });
    return student;
  });
}

export async function changeStudentStatus(tenantId: string, actorUserId: string, studentId: string, input: { status: string; reason: string; effectiveDate: string }) {
  if (!input.reason.trim()) throw new Error("A reason is required");
  return withTenant(tenantId, async (tx) => {
    const current = await tx.query.students.findFirst({ where: and(eq(students.tenantId, tenantId), eq(students.id, studentId)) });
    if (!current) throw new Error("Student not found");
    if (input.status === "inactive" && current.archivedAt) throw new Error("Student is already archived");
    const [student] = await tx.update(students).set({ status: input.status, archivedAt: input.status === "inactive" ? new Date() : null, archiveReason: input.status === "inactive" ? input.reason.trim() : null, updatedAt: new Date() }).where(and(eq(students.tenantId, tenantId), eq(students.id, studentId))).returning();
    await tx.insert(studentStatusHistory).values({ tenantId, studentId, fromStatus: current.status, toStatus: input.status, reason: input.reason.trim(), effectiveDate: input.effectiveDate, changedBy: actorUserId });
    await writeAuditLog(tx, { tenantId, actorUserId, action: "student.status_changed", entityType: "student", entityId: studentId, metadata: { from: current.status, to: input.status, reason: input.reason } });
    return student;
  });
}

type TenantTx = Parameters<Parameters<typeof withTenant>[1]>[0];
async function listStudentGuardiansTx(tx: TenantTx, tenantId: string, studentId: string) {
  return tx.select({ linkId: studentGuardians.id, guardianId: guardianProfiles.id, firstName: guardianProfiles.firstName, lastName: guardianProfiles.lastName, email: guardianProfiles.email, phonePrimary: guardianProfiles.phonePrimary, relationship: studentGuardians.relationship, isPrimary: studentGuardians.isPrimary, portalAccess: studentGuardians.portalAccess, receivesSms: studentGuardians.receivesSms, receivesEmail: studentGuardians.receivesEmail, receivesReports: studentGuardians.receivesReports, canPickup: studentGuardians.canPickup }).from(studentGuardians).innerJoin(guardianProfiles, eq(studentGuardians.guardianId, guardianProfiles.id)).where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.studentId, studentId))).orderBy(desc(studentGuardians.isPrimary), asc(guardianProfiles.firstName));
}

export async function listStudentGuardians(tenantId: string, studentId: string) { return withTenant(tenantId, (tx) => listStudentGuardiansTx(tx, tenantId, studentId)); }

export async function linkGuardian(tenantId: string, studentId: string, input: { guardianId?: string; firstName?: string; lastName?: string; phonePrimary?: string; email?: string; relationship: GuardianRelationship; isPrimary?: boolean; receivesSms?: boolean; receivesEmail?: boolean; receivesReports?: boolean; canPickup?: boolean }) {
  return withTenant(tenantId, async (tx) => {
    const student = await tx.query.students.findFirst({ where: and(eq(students.tenantId, tenantId), eq(students.id, studentId)) });
    if (!student) throw new Error("Student not found");
    let guardianId = input.guardianId;
    if (guardianId) {
      const guardian = await tx.query.guardianProfiles.findFirst({ where: and(eq(guardianProfiles.tenantId, tenantId), eq(guardianProfiles.id, guardianId)) });
      if (!guardian) throw new Error("Guardian not found");
    } else {
      if (!input.firstName || !input.lastName) throw new Error("Guardian first and last name are required");
      const [guardian] = await tx.insert(guardianProfiles).values({ tenantId, firstName: input.firstName.trim(), lastName: input.lastName.trim(), phonePrimary: input.phonePrimary?.trim() || null, email: input.email?.trim().toLowerCase() || null }).returning();
      guardianId = guardian.id;
    }
    if (input.isPrimary) await tx.update(studentGuardians).set({ isPrimary: false }).where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.studentId, studentId), eq(studentGuardians.isPrimary, true)));
    const [link] = await tx.insert(studentGuardians).values({ tenantId, studentId, guardianId, relationship: input.relationship, isPrimary: input.isPrimary ?? false, receivesSms: input.receivesSms ?? true, receivesEmail: input.receivesEmail ?? true, receivesReports: input.receivesReports ?? true, canPickup: input.canPickup ?? true }).returning();
    return link;
  });
}

export async function updateGuardianLink(tenantId: string, studentId: string, guardianId: string, input: Partial<{ relationship: GuardianRelationship; isPrimary: boolean; receivesSms: boolean; receivesEmail: boolean; receivesReports: boolean; canPickup: boolean; portalAccess: boolean }>) {
  return withTenant(tenantId, async (tx) => {
    if (input.isPrimary) await tx.update(studentGuardians).set({ isPrimary: false }).where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.studentId, studentId), eq(studentGuardians.isPrimary, true), ne(studentGuardians.guardianId, guardianId)));
    const [link] = await tx.update(studentGuardians).set(input).where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.studentId, studentId), eq(studentGuardians.guardianId, guardianId))).returning();
    if (!link) throw new Error("Guardian link not found"); return link;
  });
}
export async function unlinkGuardian(tenantId: string, studentId: string, guardianId: string) { return withTenant(tenantId, async (tx) => { const [link] = await tx.delete(studentGuardians).where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.studentId, studentId), eq(studentGuardians.guardianId, guardianId))).returning(); if (!link) throw new Error("Guardian link not found"); return link; }); }

export async function listDocuments(tenantId: string, studentId: string) { return withTenant(tenantId, (tx) => tx.select().from(studentDocuments).where(and(eq(studentDocuments.tenantId, tenantId), eq(studentDocuments.studentId, studentId))).orderBy(desc(studentDocuments.createdAt))); }
export async function addDocument(tenantId: string, userId: string, studentId: string, input: { documentType: string; label: string; fileUrl: string; fileName: string; fileSizeBytes?: number; mimeType?: string }) { return withTenant(tenantId, async (tx) => { const [document] = await tx.insert(studentDocuments).values({ tenantId, studentId, uploadedBy: userId, ...input }).returning(); return document; }); }
export async function verifyDocument(tenantId: string, userId: string, studentId: string, documentId: string, input: { verificationStatus: "verified" | "rejected"; verificationNote?: string }) { return withTenant(tenantId, async (tx) => { const [document] = await tx.update(studentDocuments).set({ ...input, verifiedBy: userId, verifiedAt: new Date() }).where(and(eq(studentDocuments.tenantId, tenantId), eq(studentDocuments.studentId, studentId), eq(studentDocuments.id, documentId))).returning(); if (!document) throw new Error("Document not found"); return document; }); }

export async function listNotes(tenantId: string, studentId: string, includeSafeguarding: boolean) { return withTenant(tenantId, (tx) => tx.select().from(studentNotes).where(and(eq(studentNotes.tenantId, tenantId), eq(studentNotes.studentId, studentId), isNull(studentNotes.archivedAt), includeSafeguarding ? undefined : ne(studentNotes.category, "safeguarding"))).orderBy(desc(studentNotes.createdAt))); }
export async function addNote(tenantId: string, userId: string, studentId: string, input: { body: string; category?: StudentNoteCategory; visibility?: "staff" | "admin_only" | "restricted" }) { return withTenant(tenantId, async (tx) => { const [note] = await tx.insert(studentNotes).values({ tenantId, studentId, createdBy: userId, body: input.body.trim(), category: input.category ?? "general", visibility: input.visibility ?? "staff" }).returning(); return note; }); }

export async function listGuardianDirectory(tenantId: string, q?: string) { return withTenant(tenantId, (tx) => tx.select({ id: guardianProfiles.id, firstName: guardianProfiles.firstName, lastName: guardianProfiles.lastName, phonePrimary: guardianProfiles.phonePrimary, email: guardianProfiles.email, userId: guardianProfiles.userId, childCount: count(studentGuardians.id), firstChild: sql<string | null>`min(${students.firstName} || ' ' || coalesce(${students.lastName}, ''))` }).from(guardianProfiles).leftJoin(studentGuardians, eq(studentGuardians.guardianId, guardianProfiles.id)).leftJoin(students, eq(studentGuardians.studentId, students.id)).where(and(eq(guardianProfiles.tenantId, tenantId), q ? or(ilike(guardianProfiles.firstName, `%${q}%`), ilike(guardianProfiles.lastName, `%${q}%`), ilike(guardianProfiles.phonePrimary, `%${q}%`), ilike(guardianProfiles.email, `%${q}%`)) : undefined)).groupBy(guardianProfiles.id).orderBy(asc(guardianProfiles.firstName))); }
export async function getGuardian(tenantId: string, guardianId: string) { return withTenant(tenantId, async (tx) => { const guardian = await tx.query.guardianProfiles.findFirst({ where: and(eq(guardianProfiles.tenantId, tenantId), eq(guardianProfiles.id, guardianId)) }); if (!guardian) return null; const children = await tx.select({ id: students.id, firstName: students.firstName, lastName: students.lastName, admissionNumber: students.admissionNumber, relationship: studentGuardians.relationship, receivesSms: studentGuardians.receivesSms, receivesEmail: studentGuardians.receivesEmail, receivesReports: studentGuardians.receivesReports }).from(studentGuardians).innerJoin(students, eq(studentGuardians.studentId, students.id)).where(and(eq(studentGuardians.tenantId, tenantId), eq(studentGuardians.guardianId, guardianId))).orderBy(asc(students.firstName)); return { guardian, children }; }); }

export async function getAcademicPlacementOptions(tenantId: string) { return withTenant(tenantId, async (tx) => ({ years: await tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.startDate)), classes: await tx.select().from(academicClasses).where(eq(academicClasses.tenantId, tenantId)).orderBy(asc(academicClasses.name)), sections: await tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name)) })); }

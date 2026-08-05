import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  academicClasses,
  assignmentSubmissions,
  assignments,
  attendance,
  classSections,
  curriculumOfferings,
  examEvents,
  generatedDocuments,
  guardianProfiles,
  leaveApplications,
  libraryCopies,
  libraryIssues,
  libraryMembers,
  libraryTitles,
  parentMessages,
  reportCardGenerations,
  rooms,
  staffProfiles,
  studentEnrollments,
  studentGuardians,
  studentInvoices,
  studentResults,
  students,
  subjects,
  tenantUsers,
  timetablePeriods,
  timetableSlots,
  timetableVersions,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { Phase11Error } from "./shared";
import { listVisibleAnnouncements } from "./notifications";

export async function getParentLinkedStudents(tenantId: string, parentUserId: string) {
  return withTenant(tenantId, async (tx) => {
    const guardianRows = await tx.select({ id: guardianProfiles.id }).from(guardianProfiles)
      .where(and(eq(guardianProfiles.tenantId, tenantId), eq(guardianProfiles.userId, parentUserId)));
    if (!guardianRows.length) return [];
    const guardianIds = guardianRows.map((row) => row.id);
    return tx.select({
      guardianId: studentGuardians.guardianId,
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      admissionNumber: students.admissionNumber,
      className: academicClasses.name,
      sectionName: classSections.name,
      classId: studentEnrollments.classId,
      sectionId: studentEnrollments.sectionId,
    }).from(studentGuardians)
      .innerJoin(students, eq(students.id, studentGuardians.studentId))
      .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.status, "active")))
      .leftJoin(academicClasses, eq(academicClasses.id, studentEnrollments.classId))
      .leftJoin(classSections, eq(classSections.id, studentEnrollments.sectionId))
      .where(and(eq(studentGuardians.tenantId, tenantId), inArray(studentGuardians.guardianId, guardianIds), eq(studentGuardians.portalAccess, true)))
      .orderBy(asc(students.firstName));
  });
}

export async function requireParentStudentAccess(tenantId: string, parentUserId: string, requestedStudentId: string) {
  const linked = await getParentLinkedStudents(tenantId, parentUserId);
  const match = linked.find((student) => student.studentId === requestedStudentId);
  if (!match) throw new Phase11Error("You do not have access to this student's records.", 403);
  return match;
}

export async function getStudentForUser(tenantId: string, userId: string) {
  return withTenant(tenantId, async (tx) => {
    const [student] = await tx.select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      admissionNumber: students.admissionNumber,
      className: academicClasses.name,
      sectionName: classSections.name,
      classId: studentEnrollments.classId,
      sectionId: studentEnrollments.sectionId,
    }).from(students)
      .innerJoin(tenantUsers, eq(tenantUsers.id, students.tenantUserId))
      .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.status, "active")))
      .leftJoin(academicClasses, eq(academicClasses.id, studentEnrollments.classId))
      .leftJoin(classSections, eq(classSections.id, studentEnrollments.sectionId))
      .where(and(eq(students.tenantId, tenantId), eq(tenantUsers.userId, userId)))
      .limit(1);
    return student ?? null;
  });
}

export async function requireStudentAccess(tenantId: string, requestingUserId: string, requestedStudentId: string) {
  const student = await getStudentForUser(tenantId, requestingUserId);
  if (!student || student.id !== requestedStudentId) throw new Phase11Error("You can only access your own records.", 403);
  return student;
}

async function getStudentPortalData(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const [enrollment] = await tx.select().from(studentEnrollments)
      .where(and(eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.studentId, studentId), eq(studentEnrollments.status, "active")))
      .limit(1);
    const sectionId = enrollment?.sectionId;
    const classId = enrollment?.classId;

    const [attendanceRows, invoiceRows, resultRows, assignmentRows, submissionRows, leaveRows, reportCards, documents] = await Promise.all([
      tx.select().from(attendance).where(and(eq(attendance.tenantId, tenantId), eq(attendance.studentId, studentId))).orderBy(desc(attendance.date)).limit(60),
      tx.select().from(studentInvoices).where(and(eq(studentInvoices.tenantId, tenantId), eq(studentInvoices.studentId, studentId))).orderBy(desc(studentInvoices.dueDate)).limit(50),
      tx.select().from(studentResults).where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.studentId, studentId), eq(studentResults.isPublished, true))).orderBy(desc(studentResults.computedAt)).limit(50),
      sectionId ? tx.select().from(assignments).where(and(eq(assignments.tenantId, tenantId), eq(assignments.sectionId, sectionId))).orderBy(asc(assignments.dueDate)).limit(50) : Promise.resolve([]),
      tx.select().from(assignmentSubmissions).where(and(eq(assignmentSubmissions.tenantId, tenantId), eq(assignmentSubmissions.studentId, studentId))).orderBy(desc(assignmentSubmissions.updatedAt)).limit(100),
      tx.select().from(leaveApplications).where(and(eq(leaveApplications.tenantId, tenantId), eq(leaveApplications.studentId, studentId))).orderBy(desc(leaveApplications.createdAt)).limit(30),
      tx.select().from(reportCardGenerations).where(and(eq(reportCardGenerations.tenantId, tenantId), eq(reportCardGenerations.studentId, studentId))).orderBy(desc(reportCardGenerations.generatedAt)).limit(20),
      tx.select().from(generatedDocuments).where(and(eq(generatedDocuments.tenantId, tenantId), eq(generatedDocuments.studentId, studentId))).orderBy(desc(generatedDocuments.generatedAt)).limit(20),
    ]);

    const [member] = await tx.select().from(libraryMembers).where(and(eq(libraryMembers.tenantId, tenantId), eq(libraryMembers.studentId, studentId))).limit(1);
    const library = member
      ? await tx.select({
          issueId: libraryIssues.id,
          status: libraryIssues.status,
          issuedAt: libraryIssues.issuedAt,
          dueDate: libraryIssues.dueDate,
          returnedAt: libraryIssues.returnedAt,
          finePaise: libraryIssues.finePaise,
          accessionNumber: libraryCopies.accession,
          title: libraryTitles.title,
        }).from(libraryIssues)
          .innerJoin(libraryCopies, eq(libraryCopies.id, libraryIssues.copyId))
          .innerJoin(libraryTitles, eq(libraryTitles.id, libraryCopies.titleId))
          .where(and(eq(libraryIssues.tenantId, tenantId), eq(libraryIssues.memberId, member.id)))
          .orderBy(desc(libraryIssues.issuedAt)).limit(50)
      : [];

    const timetable = sectionId
      ? await tx.select({
          dayOfWeek: timetableSlots.dayOfWeek,
          periodName: timetablePeriods.name,
          startTime: timetablePeriods.startTime,
          endTime: timetablePeriods.endTime,
          subjectName: subjects.name,
          teacherName: staffProfiles.fullName,
          roomName: rooms.name,
        }).from(timetableVersions)
          .innerJoin(timetableSlots, eq(timetableSlots.versionId, timetableVersions.id))
          .innerJoin(timetablePeriods, eq(timetablePeriods.id, timetableSlots.periodId))
          .innerJoin(curriculumOfferings, eq(curriculumOfferings.id, timetableSlots.offeringId))
          .innerJoin(subjects, eq(subjects.id, curriculumOfferings.subjectId))
          .innerJoin(staffProfiles, eq(staffProfiles.id, timetableSlots.staffId))
          .leftJoin(rooms, eq(rooms.id, timetableSlots.roomId))
          .where(and(eq(timetableVersions.tenantId, tenantId), eq(timetableVersions.status, "published"), eq(timetableSlots.sectionId, sectionId)))
          .orderBy(asc(timetableSlots.dayOfWeek), asc(timetablePeriods.startTime))
      : [];

    const nextExam = sectionId
      ? await tx.select().from(examEvents).where(and(eq(examEvents.tenantId, tenantId), eq(examEvents.sectionId, sectionId), sql`${examEvents.examDate} >= current_date`)).orderBy(asc(examEvents.examDate)).limit(1)
      : [];

    const outstandingPaise = invoiceRows.reduce((sum, invoice) => sum + (invoice.balancePaise ?? invoice.totalPaise ?? invoice.amount * 100), 0);
    const present = attendanceRows.filter((row) => row.status === "present").length;
    const attendancePercent = attendanceRows.length ? Math.round((present / attendanceRows.length) * 100) : null;

    return {
      enrollment,
      classId,
      sectionId,
      attendance: attendanceRows,
      attendancePercent,
      invoices: invoiceRows,
      outstandingPaise,
      results: resultRows,
      assignments: assignmentRows.map((assignment) => ({
        ...assignment,
        submission: submissionRows.find((submission) => submission.assignmentId === assignment.id) ?? null,
      })),
      leaves: leaveRows,
      library,
      timetable,
      nextExam: nextExam[0] ?? null,
      reportCards,
      documents,
    };
  });
}

export async function getParentPortalModel(tenantId: string, parentUserId: string, selectedStudentId?: string | null) {
  const linkedStudents = await getParentLinkedStudents(tenantId, parentUserId);
  const selected = selectedStudentId
    ? await requireParentStudentAccess(tenantId, parentUserId, selectedStudentId)
    : linkedStudents[0] ?? null;
  if (!selected) return { linkedStudents, selected: null, data: null, announcements: [] };
  const data = await getStudentPortalData(tenantId, selected.studentId);
  const announcements = await listVisibleAnnouncements(tenantId, "parent", parentUserId, data.sectionId ? [data.sectionId] : []);
  return { linkedStudents, selected, data, announcements };
}

export async function getStudentPortalModel(tenantId: string, userId: string) {
  const student = await getStudentForUser(tenantId, userId);
  if (!student) return { student: null, data: null, announcements: [] };
  const data = await getStudentPortalData(tenantId, student.id);
  const announcements = await listVisibleAnnouncements(tenantId, "student", userId, data.sectionId ? [data.sectionId] : []);
  return { student, data, announcements };
}

export async function applyStudentLeaveFromParent(tenantId: string, parentUserId: string, input: { studentId: string; fromDate: string; toDate: string; reason?: string | null }) {
  await requireParentStudentAccess(tenantId, parentUserId, input.studentId);
  return withTenant(tenantId, async (tx) => {
    const [leave] = await tx.insert(leaveApplications).values({
      tenantId,
      studentId: input.studentId,
      fromDate: input.fromDate,
      toDate: input.toDate,
      reason: input.reason ?? null,
      requestedBy: parentUserId,
    }).returning();
    return leave;
  });
}

export async function submitAssignmentAsStudent(tenantId: string, userId: string, assignmentId: string, content: string) {
  const student = await getStudentForUser(tenantId, userId);
  if (!student) throw new Phase11Error("Student profile not linked to this account.", 403);
  return withTenant(tenantId, async (tx) => {
    const [assignment] = await tx.select().from(assignments)
      .where(and(eq(assignments.tenantId, tenantId), eq(assignments.id, assignmentId)))
      .limit(1);
    if (!assignment || assignment.sectionId !== student.sectionId) throw new Phase11Error("Assignment is not available to this student.", 403);
    const submittedAt = new Date();
    const [submission] = await tx.insert(assignmentSubmissions).values({
      tenantId,
      assignmentId,
      studentId: student.id,
      content,
      status: "submitted",
      submittedAt,
      isLate: submittedAt > new Date(`${assignment.dueDate}T23:59:59`),
    }).onConflictDoUpdate({
      target: [assignmentSubmissions.assignmentId, assignmentSubmissions.studentId],
      set: { content, status: "submitted", submittedAt, isLate: submittedAt > new Date(`${assignment.dueDate}T23:59:59`), updatedAt: new Date() },
    }).returning();
    return submission;
  });
}

export async function listParentMessagesForUser(tenantId: string, parentUserId: string) {
  const linkedStudents = await getParentLinkedStudents(tenantId, parentUserId);
  const studentIds = linkedStudents.map((student) => student.studentId);
  if (!studentIds.length) return [];
  return withTenant(tenantId, (tx) => tx.select().from(parentMessages)
    .where(and(eq(parentMessages.tenantId, tenantId), inArray(parentMessages.studentId, studentIds)))
    .orderBy(desc(parentMessages.createdAt)));
}

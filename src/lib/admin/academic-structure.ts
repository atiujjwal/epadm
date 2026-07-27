import { and, asc, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import {
  academicClasses,
  academicYears,
  classTeacherHistory,
  classSections,
  staffProfiles,
  studentEnrollments,
  students,
  tenantUsers,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const ACADEMICS_READ_PERMISSION = "academics.read" as const;
export const ACADEMICS_WRITE_PERMISSION = "academics.write" as const;

export type ClassRecord = {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  academicYearId: string | null;
  academicYearName: string | null;
  status: string;
  homeroomStaffId: string | null;
  homeroomStaffName: string | null;
  classTeacherId: string | null;
  classTeacherName: string | null;
  createdAt: Date;
};

export type AcademicYearRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: Date;
};

export type SectionRecord = {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  name: string;
  capacity: number | null;
  status: string;
  createdAt: Date;
};

export type EnrollmentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  sectionId: string | null;
  sectionName: string | null;
  academicYear: string;
  rollNumber: string | null;
  status: string;
  enrolledOn: string | null;
  createdAt: Date;
};

export type AcademicStructureSummary = {
  classCount: number;
  sectionCount: number;
  enrollmentCount: number;
};

type AuditMeta = {
  tenantId: string;
  actorUserId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type CreateClassInput = AuditMeta & {
  code: string;
  name: string;
  academicYearId: string;
  status?: string;
  classTeacherId: string;
};

export type UpdateClassInput = AuditMeta & {
  id: string;
  code: string;
  name: string;
  academicYearId: string;
  status?: string;
  classTeacherId: string;
};

export type CreateAcademicYearInput = AuditMeta & {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
};

export type CreateSectionInput = AuditMeta & {
  classId: string;
  name: string;
  capacity?: number;
  status?: string;
};

export type CreateEnrollmentInput = AuditMeta & {
  studentId: string;
  classId: string;
  sectionId?: string;
  academicYear: string;
  rollNumber?: string;
  status?: string;
  enrolledOn?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export async function listClasses(tenantId: string): Promise<ClassRecord[]> {
  return withTenant(tenantId, (tx) =>
    tx
      .select({
        id: academicClasses.id,
        code: academicClasses.code,
        name: academicClasses.name,
        academicYear: academicClasses.academicYear,
        academicYearId: academicClasses.academicYearId,
        academicYearName: academicYears.name,
        status: academicClasses.status,
        homeroomStaffId: academicClasses.homeroomStaffId,
        homeroomStaffName: staffProfiles.fullName,
        classTeacherId: academicClasses.classTeacherId,
        classTeacherName: staffProfiles.fullName,
        createdAt: academicClasses.createdAt,
      })
      .from(academicClasses)
      .leftJoin(academicYears, eq(academicClasses.academicYearId, academicYears.id))
      .leftJoin(staffProfiles, eq(academicClasses.classTeacherId, staffProfiles.id))
      .where(eq(academicClasses.tenantId, tenantId))
      .orderBy(desc(academicClasses.createdAt), asc(academicClasses.name)),
  );
}

export async function listAcademicYears(tenantId: string): Promise<AcademicYearRecord[]> {
  return withTenant(tenantId, (tx) =>
    tx
      .select({
        id: academicYears.id,
        name: academicYears.name,
        startDate: academicYears.startDate,
        endDate: academicYears.endDate,
        isCurrent: academicYears.isCurrent,
        createdAt: academicYears.createdAt,
      })
      .from(academicYears)
      .where(eq(academicYears.tenantId, tenantId))
      .orderBy(desc(academicYears.isCurrent), desc(academicYears.startDate)),
  );
}

export async function listTeacherStaff(tenantId: string): Promise<Array<{ id: string; label: string }>> {
  return withTenant(tenantId, (tx) =>
    tx
      .select({
        id: staffProfiles.id,
        fullName: staffProfiles.fullName,
        employeeCode: staffProfiles.employeeCode,
      })
      .from(staffProfiles)
      .leftJoin(tenantUsers, eq(staffProfiles.tenantUserId, tenantUsers.id))
      .where(
        and(
          eq(staffProfiles.tenantId, tenantId),
          eq(staffProfiles.status, "active"),
          or(
            and(
              eq(tenantUsers.tenantId, tenantId),
              eq(tenantUsers.role, "teacher"),
              eq(tenantUsers.isActive, true),
            ),
            ilike(staffProfiles.jobTitle, "%teacher%"),
            ilike(staffProfiles.jobTitle, "%academic%"),
            ilike(staffProfiles.department, "%academic%"),
          ),
        ),
      )
      .orderBy(asc(staffProfiles.fullName)),
  ).then((rows) =>
    rows.map((row) => ({
      id: row.id,
      label: `${row.fullName} (${row.employeeCode})`,
    })),
  );
}

export async function listSections(tenantId: string): Promise<SectionRecord[]> {
  return withTenant(tenantId, (tx) =>
    tx
      .select({
        id: classSections.id,
        classId: classSections.classId,
        className: academicClasses.name,
        classCode: academicClasses.code,
        name: classSections.name,
        capacity: classSections.capacity,
        status: classSections.status,
        createdAt: classSections.createdAt,
      })
      .from(classSections)
      .innerJoin(academicClasses, eq(classSections.classId, academicClasses.id))
      .where(eq(classSections.tenantId, tenantId))
      .orderBy(desc(classSections.createdAt), asc(classSections.name)),
  );
}

export async function listEnrollments(tenantId: string): Promise<EnrollmentRecord[]> {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: studentEnrollments.id,
        studentId: studentEnrollments.studentId,
        studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`,
        admissionNumber: students.admissionNumber,
        classId: studentEnrollments.classId,
        className: academicClasses.name,
        sectionId: studentEnrollments.sectionId,
        sectionName: classSections.name,
        academicYear: studentEnrollments.academicYear,
        rollNumber: studentEnrollments.rollNumber,
        status: studentEnrollments.status,
        enrolledOn: studentEnrollments.enrolledOn,
        createdAt: studentEnrollments.createdAt,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .innerJoin(academicClasses, eq(studentEnrollments.classId, academicClasses.id))
      .leftJoin(classSections, eq(studentEnrollments.sectionId, classSections.id))
      .where(eq(studentEnrollments.tenantId, tenantId))
      .orderBy(desc(studentEnrollments.createdAt), asc(students.firstName)),
  );

  return rows.map((row) => ({
    ...row,
    studentName: row.studentName.trim(),
    enrolledOn: row.enrolledOn ? String(row.enrolledOn) : null,
  }));
}

export async function getAcademicStructureSummary(
  tenantId: string,
): Promise<AcademicStructureSummary> {
  const [[classCounts], [sectionCounts], [enrollmentCounts]] = await withTenant(
    tenantId,
    (tx) =>
      Promise.all([
        tx
          .select({ total: count(academicClasses.id) })
          .from(academicClasses)
          .where(eq(academicClasses.tenantId, tenantId)),
        tx
          .select({ total: count(classSections.id) })
          .from(classSections)
          .where(eq(classSections.tenantId, tenantId)),
        tx
          .select({ total: count(studentEnrollments.id) })
          .from(studentEnrollments)
          .where(eq(studentEnrollments.tenantId, tenantId)),
      ]),
  );

  return {
    classCount: Number(classCounts?.total ?? 0),
    sectionCount: Number(sectionCounts?.total ?? 0),
    enrollmentCount: Number(enrollmentCounts?.total ?? 0),
  };
}

export async function createClass(input: CreateClassInput) {
  const code = normalizeCode(input.code);

  return withTenant(input.tenantId, async (tx) => {
    const [targetYear, teacher] = await Promise.all([
      tx.query.academicYears.findFirst({
        where: and(
          eq(academicYears.id, input.academicYearId),
          eq(academicYears.tenantId, input.tenantId),
        ),
      }),
      tx
        .select({ id: staffProfiles.id })
        .from(staffProfiles)
        .leftJoin(tenantUsers, eq(staffProfiles.tenantUserId, tenantUsers.id))
        .where(
          and(
            eq(staffProfiles.id, input.classTeacherId),
            eq(staffProfiles.tenantId, input.tenantId),
            eq(staffProfiles.status, "active"),
            or(
              and(
                eq(tenantUsers.tenantId, input.tenantId),
                eq(tenantUsers.role, "teacher"),
                eq(tenantUsers.isActive, true),
              ),
              ilike(staffProfiles.jobTitle, "%teacher%"),
              ilike(staffProfiles.jobTitle, "%academic%"),
              ilike(staffProfiles.department, "%academic%"),
            ),
          ),
        )
        .limit(1),
    ]);

    if (!targetYear) {
      throw new Error("A valid academic year is required.");
    }

    if (!teacher[0]) {
      throw new Error("A valid active teacher is required as class teacher.");
    }

    const existing = await tx.query.academicClasses.findFirst({
      where: and(
        eq(academicClasses.tenantId, input.tenantId),
        eq(academicClasses.code, code),
        eq(academicClasses.academicYearId, input.academicYearId),
      ),
    });

    if (existing) {
      throw new Error("A class with this code already exists for the academic year.");
    }

    const [created] = await tx
      .insert(academicClasses)
      .values({
        tenantId: input.tenantId,
        code,
        name: input.name.trim(),
        academicYear: targetYear.name,
        academicYearId: targetYear.id,
        status: clean(input.status) ?? "active",
        homeroomStaffId: input.classTeacherId,
        classTeacherId: input.classTeacherId,
      })
      .returning();

    await tx.insert(classTeacherHistory).values({
      tenantId: input.tenantId,
      classId: created.id,
      teacherId: input.classTeacherId,
      startDate: targetYear.startDate,
      changedByUserId: input.actorUserId,
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "academic_class.created",
      entityType: "academic_class",
      entityId: created.id,
      metadata: {
        code: created.code,
        name: created.name,
        academicYear: created.academicYear,
        academicYearId: created.academicYearId,
        classTeacherId: created.classTeacherId,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return created;
  });
}

export async function updateClass(input: UpdateClassInput) {
  const code = normalizeCode(input.code);

  return withTenant(input.tenantId, async (tx) => {
    const existingClass = await tx.query.academicClasses.findFirst({
      where: and(
        eq(academicClasses.id, input.id),
        eq(academicClasses.tenantId, input.tenantId),
      ),
    });

    if (!existingClass) {
      throw new Error("Class not found for this tenant.");
    }

    const [targetYear, teacher] = await Promise.all([
      tx.query.academicYears.findFirst({
        where: and(
          eq(academicYears.id, input.academicYearId),
          eq(academicYears.tenantId, input.tenantId),
        ),
      }),
      tx
        .select({ id: staffProfiles.id })
        .from(staffProfiles)
        .leftJoin(tenantUsers, eq(staffProfiles.tenantUserId, tenantUsers.id))
        .where(
          and(
            eq(staffProfiles.id, input.classTeacherId),
            eq(staffProfiles.tenantId, input.tenantId),
            eq(staffProfiles.status, "active"),
            or(
              and(
                eq(tenantUsers.tenantId, input.tenantId),
                eq(tenantUsers.role, "teacher"),
                eq(tenantUsers.isActive, true),
              ),
              ilike(staffProfiles.jobTitle, "%teacher%"),
              ilike(staffProfiles.jobTitle, "%academic%"),
              ilike(staffProfiles.department, "%academic%"),
            ),
          ),
        )
        .limit(1),
    ]);

    if (!targetYear) {
      throw new Error("A valid academic year is required.");
    }

    if (!teacher[0]) {
      throw new Error("A valid active teacher is required as class teacher.");
    }

    const duplicate = await tx.query.academicClasses.findFirst({
      where: and(
        eq(academicClasses.tenantId, input.tenantId),
        eq(academicClasses.code, code),
        eq(academicClasses.academicYearId, input.academicYearId),
      ),
    });

    if (duplicate && duplicate.id !== input.id) {
      throw new Error("A class with this code already exists for the academic year.");
    }

    const teacherChanged = existingClass.classTeacherId !== input.classTeacherId;
    const today = new Date().toISOString().slice(0, 10);

    if (teacherChanged) {
      await tx
        .update(classTeacherHistory)
        .set({ endDate: today })
        .where(
          and(
            eq(classTeacherHistory.tenantId, input.tenantId),
            eq(classTeacherHistory.classId, input.id),
            isNull(classTeacherHistory.endDate),
          ),
        );

      await tx.insert(classTeacherHistory).values({
        tenantId: input.tenantId,
        classId: input.id,
        teacherId: input.classTeacherId,
        startDate: today,
        changedByUserId: input.actorUserId,
      });
    }

    const [updated] = await tx
      .update(academicClasses)
      .set({
        code,
        name: input.name.trim(),
        academicYear: targetYear.name,
        academicYearId: targetYear.id,
        status: clean(input.status) ?? "active",
        homeroomStaffId: input.classTeacherId,
        classTeacherId: input.classTeacherId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(academicClasses.id, input.id),
          eq(academicClasses.tenantId, input.tenantId),
        ),
      )
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: teacherChanged ? "academic_class.teacher_changed" : "academic_class.updated",
      entityType: "academic_class",
      entityId: updated.id,
      metadata: {
        previousClassTeacherId: existingClass.classTeacherId,
        classTeacherId: updated.classTeacherId,
        academicYearId: updated.academicYearId,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return updated;
  });
}

export async function createAcademicYear(input: CreateAcademicYearInput) {
  return withTenant(input.tenantId, async (tx) => {
    const name = input.name.trim();
    if (new Date(input.startDate) > new Date(input.endDate)) {
      throw new Error("Academic year start date must be before end date.");
    }

    if (input.isCurrent) {
      await tx
        .update(academicYears)
        .set({ isCurrent: false, updatedAt: new Date() })
        .where(eq(academicYears.tenantId, input.tenantId));
    }

    const [created] = await tx
      .insert(academicYears)
      .values({
        tenantId: input.tenantId,
        name,
        startDate: input.startDate,
        endDate: input.endDate,
        isCurrent: input.isCurrent ?? false,
      })
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "academic_year.created",
      entityType: "academic_year",
      entityId: created.id,
      metadata: { name: created.name, isCurrent: created.isCurrent },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return created;
  });
}

export async function createSection(input: CreateSectionInput) {
  return withTenant(input.tenantId, async (tx) => {
    const targetClass = await tx.query.academicClasses.findFirst({
      where: and(
        eq(academicClasses.id, input.classId),
        eq(academicClasses.tenantId, input.tenantId),
      ),
    });

    if (!targetClass) {
      throw new Error("Class not found for this tenant.");
    }

    const sectionName = input.name.trim().toUpperCase();
    const existing = await tx.query.classSections.findFirst({
      where: and(
        eq(classSections.tenantId, input.tenantId),
        eq(classSections.classId, input.classId),
        eq(classSections.name, sectionName),
      ),
    });

    if (existing) {
      throw new Error("A section with this name already exists for the class.");
    }

    const [created] = await tx
      .insert(classSections)
      .values({
        tenantId: input.tenantId,
        classId: input.classId,
        name: sectionName,
        capacity: input.capacity ?? null,
        status: clean(input.status) ?? "active",
      })
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "class_section.created",
      entityType: "class_section",
      entityId: created.id,
      metadata: {
        classId: created.classId,
        name: created.name,
        capacity: created.capacity,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return created;
  });
}

export async function createEnrollment(input: CreateEnrollmentInput) {
  return withTenant(input.tenantId, async (tx) => {
    const [student, targetClass] = await Promise.all([
      tx.query.students.findFirst({
        where: and(
          eq(students.id, input.studentId),
          eq(students.tenantId, input.tenantId),
        ),
      }),
      tx.query.academicClasses.findFirst({
        where: and(
          eq(academicClasses.id, input.classId),
          eq(academicClasses.tenantId, input.tenantId),
        ),
      }),
    ]);

    if (!student) {
      throw new Error("Student not found for this tenant.");
    }

    if (!targetClass) {
      throw new Error("Class not found for this tenant.");
    }

    if (input.sectionId) {
      const section = await tx.query.classSections.findFirst({
        where: and(
          eq(classSections.id, input.sectionId),
          eq(classSections.tenantId, input.tenantId),
          eq(classSections.classId, input.classId),
        ),
      });

      if (!section) {
        throw new Error("Section not found for the selected class.");
      }
    }

    const academicYear = input.academicYear.trim();
    const existing = await tx.query.studentEnrollments.findFirst({
      where: and(
        eq(studentEnrollments.tenantId, input.tenantId),
        eq(studentEnrollments.studentId, input.studentId),
        eq(studentEnrollments.academicYear, academicYear),
      ),
    });

    if (existing) {
      throw new Error("This student is already enrolled for the academic year.");
    }

    const [created] = await tx
      .insert(studentEnrollments)
      .values({
        tenantId: input.tenantId,
        studentId: input.studentId,
        classId: input.classId,
        sectionId: clean(input.sectionId),
        academicYear,
        rollNumber: clean(input.rollNumber),
        status: clean(input.status) ?? "active",
        enrolledOn: clean(input.enrolledOn),
      })
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "student_enrollment.created",
      entityType: "student_enrollment",
      entityId: created.id,
      metadata: {
        studentId: created.studentId,
        classId: created.classId,
        sectionId: created.sectionId,
        academicYear: created.academicYear,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return created;
  });
}

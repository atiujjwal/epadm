import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { staffProfiles, students } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const STUDENT_READ_PERMISSION = "students.read" as const;
export const STUDENT_WRITE_PERMISSION = "students.write" as const;
export const STAFF_READ_PERMISSION = "staff.read" as const;
export const STAFF_WRITE_PERMISSION = "staff.write" as const;

export type StudentRecord = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  classLabel: string | null;
  sectionLabel: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
};

export type StaffRecord = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  joinedOn: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
};

export type RegistrySummary = {
  total: number;
  active: number;
  inactive: number;
};

export type CreateStudentInput = {
  tenantId: string;
  actorUserId: string;
  admissionNumber: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  classLabel?: string;
  sectionLabel?: string;
  guardianName?: string;
  guardianPhone?: string;
  status?: string;
  notes?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type CreateStaffInput = {
  tenantId: string;
  actorUserId: string;
  employeeCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  employmentType?: string;
  joinedOn?: string;
  status?: string;
  notes?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export async function listStudents(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: students.id,
        admissionNumber: students.admissionNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        gender: students.gender,
        dateOfBirth: students.dateOfBirth,
        classLabel: students.classLabel,
        sectionLabel: students.sectionLabel,
        guardianName: students.guardianName,
        guardianPhone: students.guardianPhone,
        status: students.status,
        notes: students.notes,
        createdAt: students.createdAt,
      })
      .from(students)
      .where(
        search
          ? and(
              eq(students.tenantId, tenantId),
              or(
                ilike(students.admissionNumber, `%${search}%`),
                ilike(students.firstName, `%${search}%`),
                ilike(students.lastName, `%${search}%`),
                ilike(students.classLabel, `%${search}%`),
                ilike(students.guardianName, `%${search}%`),
              ),
            )
          : eq(students.tenantId, tenantId),
      )
      .orderBy(desc(students.createdAt), asc(students.firstName)),
  );

  return rows.map((row) => ({
    ...row,
    dateOfBirth: row.dateOfBirth ? String(row.dateOfBirth) : null,
  })) satisfies StudentRecord[];
}

export async function listStaff(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: staffProfiles.id,
        employeeCode: staffProfiles.employeeCode,
        fullName: staffProfiles.fullName,
        email: staffProfiles.email,
        phone: staffProfiles.phone,
        department: staffProfiles.department,
        jobTitle: staffProfiles.jobTitle,
        employmentType: staffProfiles.employmentType,
        joinedOn: staffProfiles.joinedOn,
        status: staffProfiles.status,
        notes: staffProfiles.notes,
        createdAt: staffProfiles.createdAt,
      })
      .from(staffProfiles)
      .where(
        search
          ? and(
              eq(staffProfiles.tenantId, tenantId),
              or(
                ilike(staffProfiles.employeeCode, `%${search}%`),
                ilike(staffProfiles.fullName, `%${search}%`),
                ilike(staffProfiles.department, `%${search}%`),
                ilike(staffProfiles.jobTitle, `%${search}%`),
              ),
            )
          : eq(staffProfiles.tenantId, tenantId),
      )
      .orderBy(desc(staffProfiles.createdAt), asc(staffProfiles.fullName)),
  );

  return rows.map((row) => ({
    ...row,
    joinedOn: row.joinedOn ? String(row.joinedOn) : null,
  })) satisfies StaffRecord[];
}

export async function getStudentSummary(tenantId: string): Promise<RegistrySummary> {
  const [counts] = await withTenant(tenantId, (tx) =>
    tx
      .select({
        total: count(students.id),
        active: sql<number>`count(*) filter (where ${students.status} = 'active')`,
        inactive: sql<number>`count(*) filter (where ${students.status} <> 'active')`,
      })
      .from(students)
      .where(eq(students.tenantId, tenantId)),
  );

  return {
    total: Number(counts?.total ?? 0),
    active: Number(counts?.active ?? 0),
    inactive: Number(counts?.inactive ?? 0),
  };
}

export async function getStaffSummary(tenantId: string): Promise<RegistrySummary> {
  const [counts] = await withTenant(tenantId, (tx) =>
    tx
      .select({
        total: count(staffProfiles.id),
        active: sql<number>`count(*) filter (where ${staffProfiles.status} = 'active')`,
        inactive: sql<number>`count(*) filter (where ${staffProfiles.status} <> 'active')`,
      })
      .from(staffProfiles)
      .where(eq(staffProfiles.tenantId, tenantId)),
  );

  return {
    total: Number(counts?.total ?? 0),
    active: Number(counts?.active ?? 0),
    inactive: Number(counts?.inactive ?? 0),
  };
}

export async function createStudent(input: CreateStudentInput) {
  const admissionNumber = normalizeCode(input.admissionNumber);

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.students.findFirst({
      where: and(
        eq(students.tenantId, input.tenantId),
        eq(students.admissionNumber, admissionNumber),
      ),
    });

    if (existing) {
      throw new Error("A student with this admission number already exists.");
    }

    const [student] = await tx
      .insert(students)
      .values({
        tenantId: input.tenantId,
        admissionNumber,
        firstName: input.firstName.trim(),
        lastName: clean(input.lastName),
        gender: clean(input.gender),
        dateOfBirth: clean(input.dateOfBirth),
        classLabel: clean(input.classLabel),
        sectionLabel: clean(input.sectionLabel),
        guardianName: clean(input.guardianName),
        guardianPhone: clean(input.guardianPhone),
        status: clean(input.status) ?? "active",
        notes: clean(input.notes),
      })
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "student.created",
      entityType: "student",
      entityId: student.id,
      metadata: {
        admissionNumber,
        classLabel: student.classLabel,
        sectionLabel: student.sectionLabel,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return student;
  });
}

export async function createStaffProfile(input: CreateStaffInput) {
  const employeeCode = normalizeCode(input.employeeCode);

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.staffProfiles.findFirst({
      where: and(
        eq(staffProfiles.tenantId, input.tenantId),
        eq(staffProfiles.employeeCode, employeeCode),
      ),
    });

    if (existing) {
      throw new Error("A staff member with this employee code already exists.");
    }

    const [staff] = await tx
      .insert(staffProfiles)
      .values({
        tenantId: input.tenantId,
        employeeCode,
        fullName: input.fullName.trim(),
        email: clean(input.email),
        phone: clean(input.phone),
        department: clean(input.department),
        jobTitle: clean(input.jobTitle),
        employmentType: clean(input.employmentType) ?? "full_time",
        joinedOn: clean(input.joinedOn),
        status: clean(input.status) ?? "active",
        notes: clean(input.notes),
      })
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "staff_profile.created",
      entityType: "staff_profile",
      entityId: staff.id,
      metadata: {
        employeeCode,
        department: staff.department,
        jobTitle: staff.jobTitle,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return staff;
  });
}

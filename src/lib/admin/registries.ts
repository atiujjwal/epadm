import { and, asc, count, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { staffDepartments, staffProfiles, students } from "@/lib/db";
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
  createdAt: string;
};

export type StaffRecord = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  jobTitle: string | null;
  dateOfBirth: string | null;
  employmentType: string;
  joinedOn: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
};

export type StaffDepartmentRecord = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  headStaffId: string | null;
  headName: string | null;
  isSystem: boolean;
  status: string;
  vacancies: number;
  headcount: number;
  activeCount: number;
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
  dateOfBirth: string;
  employmentType?: string;
  joinedOn?: string;
  status?: string;
  notes?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type UpdateStaffInput = Omit<CreateStaffInput, "dateOfBirth"> & {
  id: string;
  dateOfBirth?: string;
};

export type StaffDepartmentInput = {
  tenantId: string;
  actorUserId: string;
  code?: string;
  name: string;
  description?: string;
  headStaffId?: string;
  status?: string;
  vacancies?: number;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type UpdateStaffDepartmentInput = StaffDepartmentInput & {
  id: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

const DEFAULT_STAFF_DEPARTMENTS = [
  {
    code: "ACAD",
    name: "Academics / Faculty",
    description: "Teaching faculty, curriculum planning, and academic delivery",
  },
  {
    code: "ADMIN",
    name: "Administration & HR",
    description: "School administration, HR operations, and office coordination",
  },
  {
    code: "FIN",
    name: "Accounts & Finance",
    description: "Accounts, fees, payroll, budgeting, and finance operations",
  },
  {
    code: "HEALTH",
    name: "Student Services & Health",
    description: "Student wellbeing, counselling, health, and support services",
  },
  {
    code: "LIB",
    name: "Library & Resources",
    description: "Library operations, learning resources, and media assets",
  },
  {
    code: "TRANS",
    name: "Facilities & Transport",
    description: "Campus facilities, maintenance, security, and transport",
  },
  {
    code: "IT",
    name: "IT & Support",
    description: "IT systems, helpdesk support, devices, and infrastructure",
  },
] as const;

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
    createdAt: row.createdAt.toISOString(),
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
        dateOfBirth: staffProfiles.dateOfBirth,
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
    dateOfBirth: row.dateOfBirth ? String(row.dateOfBirth) : null,
    joinedOn: row.joinedOn ? String(row.joinedOn) : null,
  })) satisfies StaffRecord[];
}

export async function listStaffDepartments(tenantId: string): Promise<StaffDepartmentRecord[]> {
  await seedDefaultDepartments(tenantId);

  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: staffDepartments.id,
        code: staffDepartments.code,
        name: staffDepartments.name,
        description: staffDepartments.description,
        headStaffId: staffDepartments.headStaffId,
        headName: staffProfiles.fullName,
        isSystem: staffDepartments.isSystem,
        status: staffDepartments.status,
        vacancies: staffDepartments.vacancies,
        createdAt: staffDepartments.createdAt,
      })
      .from(staffDepartments)
      .leftJoin(staffProfiles, eq(staffDepartments.headStaffId, staffProfiles.id))
      .where(eq(staffDepartments.tenantId, tenantId))
      .orderBy(asc(staffDepartments.name)),
  );

  const staff = await listStaff(tenantId);

  return rows.map((row) => {
    const members = staff.filter((member) => member.department === row.name);
    return {
      ...row,
      headcount: members.length,
      activeCount: members.filter((member) => member.status === "active").length,
    };
  });
}

export async function seedDefaultDepartments(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    for (const item of DEFAULT_STAFF_DEPARTMENTS) {
      const existing = await tx.query.staffDepartments.findFirst({
        where: and(eq(staffDepartments.tenantId, tenantId), eq(staffDepartments.code, item.code)),
      });

      if (existing) {
        await tx
          .update(staffDepartments)
          .set({
            name: item.name,
            description: item.description,
            isSystem: true,
            updatedAt: new Date(),
          })
          .where(and(eq(staffDepartments.tenantId, tenantId), eq(staffDepartments.id, existing.id)));
        continue;
      }

      await tx.insert(staffDepartments).values({
        tenantId,
        code: item.code,
        name: item.name,
        description: item.description,
        isSystem: true,
        status: "active",
        vacancies: 0,
      });
    }
  });
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

    return {
      ...student,
      dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth) : null,
      createdAt: student.createdAt.toISOString(),
    };
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
        dateOfBirth: input.dateOfBirth,
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

export async function updateStaffProfile(input: UpdateStaffInput) {
  const employeeCode = normalizeCode(input.employeeCode);

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.staffProfiles.findFirst({
      where: and(
        eq(staffProfiles.tenantId, input.tenantId),
        eq(staffProfiles.id, input.id),
      ),
    });

    if (!existing) {
      throw new Error("Staff record not found.");
    }

    const duplicate = await tx.query.staffProfiles.findFirst({
      where: and(
        eq(staffProfiles.tenantId, input.tenantId),
        eq(staffProfiles.employeeCode, employeeCode),
        ne(staffProfiles.id, input.id),
      ),
    });

    if (duplicate) {
      throw new Error("A staff member with this employee code already exists.");
    }

    const [staff] = await tx
      .update(staffProfiles)
      .set({
        employeeCode,
        fullName: input.fullName.trim(),
        email: clean(input.email),
        phone: clean(input.phone),
        department: clean(input.department),
        jobTitle: clean(input.jobTitle),
        dateOfBirth: clean(input.dateOfBirth) ?? existing.dateOfBirth,
        employmentType: clean(input.employmentType) ?? "full_time",
        joinedOn: clean(input.joinedOn),
        status: clean(input.status) ?? "active",
        notes: clean(input.notes),
        updatedAt: new Date(),
      })
      .where(and(eq(staffProfiles.tenantId, input.tenantId), eq(staffProfiles.id, input.id)))
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "staff_profile.updated",
      entityType: "staff_profile",
      entityId: staff.id,
      metadata: { employeeCode, department: staff.department, jobTitle: staff.jobTitle },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return staff;
  });
}

export async function deleteStaffProfile(input: {
  tenantId: string;
  actorUserId: string;
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  return withTenant(input.tenantId, async (tx) => {
    const [deleted] = await tx
      .delete(staffProfiles)
      .where(and(eq(staffProfiles.tenantId, input.tenantId), eq(staffProfiles.id, input.id)))
      .returning();

    if (!deleted) {
      throw new Error("Staff record not found.");
    }

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "staff_profile.deleted",
      entityType: "staff_profile",
      entityId: deleted.id,
      metadata: { employeeCode: deleted.employeeCode },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return deleted;
  });
}

export async function createStaffDepartment(input: StaffDepartmentInput) {
  const code = clean(input.code) ? normalizeCode(input.code!) : null;

  return withTenant(input.tenantId, async (tx) => {
    if (code) {
      const existing = await tx.query.staffDepartments.findFirst({
        where: and(eq(staffDepartments.tenantId, input.tenantId), eq(staffDepartments.code, code)),
      });
      if (existing) throw new Error("A department with this code already exists.");
    }

    const [department] = await tx
      .insert(staffDepartments)
      .values({
        tenantId: input.tenantId,
        code,
        name: input.name.trim(),
        description: clean(input.description),
        headStaffId: clean(input.headStaffId),
        status: clean(input.status) ?? "active",
        vacancies: input.vacancies ?? 0,
      })
      .returning();

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "staff_department.created",
      entityType: "staff_department",
      entityId: department.id,
      metadata: { code, name: department.name },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return department;
  });
}

export async function updateStaffDepartment(input: UpdateStaffDepartmentInput) {
  const code = clean(input.code) ? normalizeCode(input.code!) : null;

  return withTenant(input.tenantId, async (tx) => {
    if (code) {
      const duplicate = await tx.query.staffDepartments.findFirst({
        where: and(
          eq(staffDepartments.tenantId, input.tenantId),
          eq(staffDepartments.code, code),
          ne(staffDepartments.id, input.id),
        ),
      });
      if (duplicate) throw new Error("A department with this code already exists.");
    }

    const [department] = await tx
      .update(staffDepartments)
      .set({
        code,
        name: input.name.trim(),
        description: clean(input.description),
        headStaffId: clean(input.headStaffId),
        status: clean(input.status) ?? "active",
        vacancies: input.vacancies ?? 0,
        updatedAt: new Date(),
      })
      .where(and(eq(staffDepartments.tenantId, input.tenantId), eq(staffDepartments.id, input.id)))
      .returning();

    if (!department) throw new Error("Department not found.");
    return department;
  });
}

export async function deleteStaffDepartment(input: { tenantId: string; id: string }) {
  return withTenant(input.tenantId, async (tx) => {
    const department = await tx.query.staffDepartments.findFirst({
      where: and(eq(staffDepartments.tenantId, input.tenantId), eq(staffDepartments.id, input.id)),
    });
    if (!department) throw new Error("Department not found.");
    if (department.isSystem) throw new Error("System default departments cannot be deleted");

    const [member] = await tx
      .select({ id: staffProfiles.id })
      .from(staffProfiles)
      .where(
        and(
          eq(staffProfiles.tenantId, input.tenantId),
          eq(staffProfiles.department, department.name),
          eq(staffProfiles.status, "active"),
        ),
      )
      .limit(1);

    if (member) throw new Error("Cannot delete a department with assigned staff.");

    const [deleted] = await tx
      .delete(staffDepartments)
      .where(and(eq(staffDepartments.tenantId, input.tenantId), eq(staffDepartments.id, input.id)))
      .returning();

    return deleted;
  });
}

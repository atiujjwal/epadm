import { PoolClient } from "pg";
import { eq, and, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { academicYears, classes, sections, subjects, students } from "./schema";
import {
  CreateAcademicYearInput,
  CreateClassInput,
  CreateSectionInput,
  CreateSubjectInput,
  CreateStudentInput,
} from "./types";
import { requirePermission } from "@/lib/auth/rbac";

export async function createAcademicYear(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateAcademicYearInput
) {
  await requirePermission(client, userId, "academic.write");
  const db = drizzle(client);

  const [record] = await db
    .insert(academicYears)
    .values({
      tenantId,
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isCurrent: data.isCurrent ?? false,
    })
    .returning();
  return record;
}

export async function getAcademicYears(
  client: PoolClient,
  tenantId: string,
  userId: string
) {
  await requirePermission(client, userId, "academic.read");
  const db = drizzle(client);

  return await db
    .select()
    .from(academicYears)
    .where(
      and(eq(academicYears.tenantId, tenantId), isNull(academicYears.deletedAt))
    );
}

export async function getCurrentAcademicYear(
  client: PoolClient,
  tenantId: string,
  userId: string
) {
  // Public read access might be allowed, but we default to authenticated read
  await requirePermission(client, userId, "academic.read");
  const db = drizzle(client);

  const result = await db
    .select()
    .from(academicYears)
    .where(
      and(
        eq(academicYears.tenantId, tenantId),
        eq(academicYears.isCurrent, true),
        isNull(academicYears.deletedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function createClass(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateClassInput
) {
  await requirePermission(client, userId, "academic.write");
  const db = drizzle(client);

  const [record] = await db
    .insert(classes)
    .values({
      tenantId,
      name: data.name,
      order: data.order ?? 0,
      academicYearId: data.academicYearId,
      // config: data.config ?? {}, // Uncomment if config column exists in schema
    })
    .returning();
  return record;
}

export async function getClasses(
  client: PoolClient,
  tenantId: string,
  userId: string,
  academicYearId?: string
) {
  await requirePermission(client, userId, "academic.read");
  const db = drizzle(client);

  const conditions = [
    eq(classes.tenantId, tenantId),
    isNull(classes.deletedAt),
  ];

  if (academicYearId) {
    conditions.push(eq(classes.academicYearId, academicYearId));
  }

  return await db
    .select()
    .from(classes)
    .where(and(...conditions))
    .orderBy(classes.order);
}

export async function createSection(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateSectionInput
) {
  await requirePermission(client, userId, "academic.write");
  const db = drizzle(client);

  const [record] = await db
    .insert(sections)
    .values({
      tenantId,
      classId: data.classId,
      name: data.name,
      classTeacherId: data.classTeacherId,
    })
    .returning();
  return record;
}

export async function getSections(
  client: PoolClient,
  tenantId: string,
  userId: string,
  classId?: string
) {
  await requirePermission(client, userId, "academic.read");
  const db = drizzle(client);

  const conditions = [
    eq(sections.tenantId, tenantId),
    isNull(sections.deletedAt),
  ];

  if (classId) {
    conditions.push(eq(sections.classId, classId));
  }

  return await db
    .select()
    .from(sections)
    .where(and(...conditions))
    .orderBy(sections.name);
}

export async function createSubject(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateSubjectInput
) {
  await requirePermission(client, userId, "academic.write");
  const db = drizzle(client);

  const [record] = await db
    .insert(subjects)
    .values({
      tenantId,
      name: data.name,
      code: data.code,
      type: data.type,
      credits: data.credits ?? 0,
    })
    .returning();

  return record;
}

export async function getSubjects(data: {
  client: PoolClient;
  tenantId: string;
  userId: string;
  limit?: number;
  skip?: number;
}) {
  const { client, tenantId, userId, limit, skip } = data;
  await requirePermission(client, userId, "academic.read");
  const db = drizzle(client);

  return await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.tenantId, tenantId), isNull(subjects.deletedAt)))
    .limit(limit || 10)
    .offset(skip || 0);
}

export async function createStudent(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateStudentInput
) {
  await requirePermission(client, userId, "student.write");
  const db = drizzle(client);

  const [record] = await db
    .insert(students)
    .values({
      tenantId,
      firstName: data.firstName,
      lastName: data.lastName,
      admissionNumber: data.admissionNumber,
      rollNumber: data.rollNumber,
      sectionId: data.sectionId,
      academicYearId: data.academicYearId,
      parentId: data.parentId,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
      isActive: true,
      // attributes: data.attributes, // Uncomment if supported by schema
    })
    .returning();
  return record;
}

export async function getStudents(
  client: PoolClient,
  tenantId: string,
  userId: string,
  filters: { sectionId?: string; academicYearId?: string; limit?: number } = {}
) {
  await requirePermission(client, userId, "student.read");
  const db = drizzle(client);

  const conditions = [
    eq(students.tenantId, tenantId),
    isNull(students.deletedAt),
  ];

  if (filters.sectionId) {
    conditions.push(eq(students.sectionId, filters.sectionId));
  }

  if (filters.academicYearId) {
    conditions.push(eq(students.academicYearId, filters.academicYearId));
  }

  return await db
    .select()
    .from(students)
    .where(and(...conditions))
    .limit(filters.limit || 50);
}

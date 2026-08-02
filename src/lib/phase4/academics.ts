import { and, asc, count, desc, eq, ne, sql } from "drizzle-orm";
import {
  academicClasses,
  academicTerms,
  academicYears,
  auditLogs,
  campuses,
  classSections,
  curriculumFrameworks,
  curriculumOfferings,
  rooms,
  schoolHouses,
  staffProfiles,
  studentEnrollments,
  students,
  subjects,
  teacherAllocations,
  timetablePeriods,
  timetableSlots,
  timetableVersions,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";

export class Phase4Error extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function phase4ApiError(error: unknown) {
  if (error instanceof Phase4Error) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Error && /duplicate key|unique constraint/i.test(error.message)) {
    return Response.json({ error: "A conflicting record already exists." }, { status: 409 });
  }
  return Response.json({ error: "Request failed" }, { status: 500 });
}

export async function listAcademicModel(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [
      years,
      terms,
      classes,
      sections,
      campusRows,
      roomRows,
      houseRows,
      frameworkRows,
    ] = await Promise.all([
      tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.isCurrent), desc(academicYears.startDate)),
      tx.select().from(academicTerms).where(eq(academicTerms.tenantId, tenantId)).orderBy(asc(academicTerms.displayOrder)),
      tx.select().from(academicClasses).where(eq(academicClasses.tenantId, tenantId)).orderBy(asc(academicClasses.displayOrder), asc(academicClasses.name)),
      tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name)),
      tx.select().from(campuses).where(eq(campuses.tenantId, tenantId)).orderBy(desc(campuses.isMain), asc(campuses.displayOrder), asc(campuses.name)),
      tx.select().from(rooms).where(eq(rooms.tenantId, tenantId)).orderBy(asc(rooms.name)),
      tx.select().from(schoolHouses).where(eq(schoolHouses.tenantId, tenantId)).orderBy(asc(schoolHouses.name)),
      tx.select().from(curriculumFrameworks).where(eq(curriculumFrameworks.tenantId, tenantId)).orderBy(asc(curriculumFrameworks.name)),
    ]);

    return { years, terms, classes, sections, campuses: campusRows, rooms: roomRows, houses: houseRows, frameworks: frameworkRows };
  });
}

export async function listEnrollmentSummary(tenantId: string, academicYearId?: string) {
  return withTenant(tenantId, async (tx) =>
    tx
      .select({
        classId: academicClasses.id,
        className: academicClasses.name,
        sectionId: classSections.id,
        sectionName: classSections.name,
        total: count(studentEnrollments.id),
        active: sql<number>`count(*) filter (where ${studentEnrollments.enrollmentStatus} = 'active' or ${studentEnrollments.status} = 'active')`,
      })
      .from(academicClasses)
      .leftJoin(classSections, eq(classSections.classId, academicClasses.id))
      .leftJoin(
        studentEnrollments,
        and(
          eq(studentEnrollments.classId, academicClasses.id),
          eq(studentEnrollments.sectionId, classSections.id),
          academicYearId ? eq(studentEnrollments.academicYearId, academicYearId) : sql`true`,
        ),
      )
      .where(eq(academicClasses.tenantId, tenantId))
      .groupBy(academicClasses.id, classSections.id)
      .orderBy(asc(academicClasses.displayOrder), asc(academicClasses.name), asc(classSections.name)),
  );
}

export async function createYear(tenantId: string, input: { name: string; startDate: string; endDate: string; status?: string; isCurrent?: boolean; campusId?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    if (input.isCurrent) await tx.update(academicYears).set({ isCurrent: false }).where(eq(academicYears.tenantId, tenantId));
    const [year] = await tx.insert(academicYears).values({ tenantId, ...input }).returning();
    return year;
  });
}

export async function createTerm(tenantId: string, input: { academicYearId: string; name: string; startDate: string; endDate: string; displayOrder?: number }) {
  return withTenant(tenantId, async (tx) => {
    const [term] = await tx.insert(academicTerms).values({ tenantId, displayOrder: 1, ...input }).returning();
    return term;
  });
}

export async function createCampus(tenantId: string, input: { name: string; shortCode?: string | null; address?: string | null; city?: string | null; phone?: string | null; email?: string | null; isMain?: boolean; displayOrder?: number }) {
  return withTenant(tenantId, async (tx) => {
    if (input.isMain) await tx.update(campuses).set({ isMain: false }).where(eq(campuses.tenantId, tenantId));
    const [campus] = await tx.insert(campuses).values({ tenantId, ...input }).returning();
    return campus;
  });
}

export async function createRoom(tenantId: string, input: { name: string; campusId?: string | null; roomType?: string; capacity?: number | null; floor?: string | null; building?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [room] = await tx.insert(rooms).values({ tenantId, roomType: "classroom", ...input }).returning();
    return room;
  });
}

export async function createHouse(tenantId: string, input: { name: string; color?: string | null; motto?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [house] = await tx.insert(schoolHouses).values({ tenantId, ...input }).returning();
    return house;
  });
}

export async function listCurriculum(tenantId: string, academicYearId?: string) {
  return withTenant(tenantId, async (tx) => {
    const [frameworkRows, subjectRows, classRows, sectionRows, offeringRows, allocationRows, staffRows] = await Promise.all([
      tx.select().from(curriculumFrameworks).where(eq(curriculumFrameworks.tenantId, tenantId)).orderBy(asc(curriculumFrameworks.name)),
      tx.select().from(subjects).where(eq(subjects.tenantId, tenantId)).orderBy(asc(subjects.name)),
      tx.select().from(academicClasses).where(eq(academicClasses.tenantId, tenantId)).orderBy(asc(academicClasses.displayOrder), asc(academicClasses.name)),
      tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name)),
      tx.select().from(curriculumOfferings).where(and(eq(curriculumOfferings.tenantId, tenantId), academicYearId ? eq(curriculumOfferings.academicYearId, academicYearId) : sql`true`)),
      tx.select().from(teacherAllocations).where(eq(teacherAllocations.tenantId, tenantId)),
      tx.select().from(staffProfiles).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.status, "active"))).orderBy(asc(staffProfiles.fullName)),
    ]);
    return { frameworks: frameworkRows, subjects: subjectRows, classes: classRows, sections: sectionRows, offerings: offeringRows, allocations: allocationRows, staff: staffRows };
  });
}

export async function createFramework(tenantId: string, input: { name: string; abbreviation?: string | null; description?: string | null }) {
  return withTenant(tenantId, async (tx) => {
    const [framework] = await tx.insert(curriculumFrameworks).values({ tenantId, ...input }).returning();
    return framework;
  });
}

export async function createOffering(tenantId: string, input: { academicYearId: string; classId: string; subjectId: string; isCore?: boolean; periodsPerWeek?: number }) {
  return withTenant(tenantId, async (tx) => {
    const [offering] = await tx.insert(curriculumOfferings).values({ tenantId, isCore: true, periodsPerWeek: 1, ...input }).returning();
    return offering;
  });
}

export async function createTeacherAllocation(tenantId: string, input: { offeringId: string; sectionId: string; staffId: string; isPrimary?: boolean }) {
  return withTenant(tenantId, async (tx) => {
    const [allocation] = await tx.insert(teacherAllocations).values({ tenantId, isPrimary: true, ...input }).returning();
    return allocation;
  });
}

export async function listTimetableModel(tenantId: string, versionId?: string) {
  return withTenant(tenantId, async (tx) => {
    const [periodRows, versionRows, slotRows, classRows, sectionRows, offeringRows, roomRows, staffRows, subjectRows, yearRows] = await Promise.all([
      tx.select().from(timetablePeriods).where(eq(timetablePeriods.tenantId, tenantId)).orderBy(asc(timetablePeriods.displayOrder), asc(timetablePeriods.startTime)),
      tx.select().from(timetableVersions).where(eq(timetableVersions.tenantId, tenantId)).orderBy(desc(timetableVersions.createdAt)),
      tx.select().from(timetableSlots).where(and(eq(timetableSlots.tenantId, tenantId), versionId ? eq(timetableSlots.versionId, versionId) : sql`true`)),
      tx.select().from(academicClasses).where(eq(academicClasses.tenantId, tenantId)).orderBy(asc(academicClasses.displayOrder), asc(academicClasses.name)),
      tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name)),
      tx.select().from(curriculumOfferings).where(eq(curriculumOfferings.tenantId, tenantId)),
      tx.select().from(rooms).where(eq(rooms.tenantId, tenantId)).orderBy(asc(rooms.name)),
      tx.select().from(staffProfiles).where(eq(staffProfiles.tenantId, tenantId)).orderBy(asc(staffProfiles.fullName)),
      tx.select().from(subjects).where(eq(subjects.tenantId, tenantId)).orderBy(asc(subjects.name)),
      tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.isCurrent), desc(academicYears.startDate)),
    ]);
    return { periods: periodRows, versions: versionRows, slots: slotRows, classes: classRows, sections: sectionRows, offerings: offeringRows, rooms: roomRows, staff: staffRows, subjects: subjectRows, years: yearRows };
  });
}

export async function createPeriod(tenantId: string, input: { name: string; startTime: string; endTime: string; isBreak?: boolean; displayOrder?: number }) {
  return withTenant(tenantId, async (tx) => {
    const [period] = await tx.insert(timetablePeriods).values({ tenantId, isBreak: false, displayOrder: 1, ...input }).returning();
    return period;
  });
}

export async function createTimetableVersion(tenantId: string, actorUserId: string, input: { name: string; academicYearId: string }) {
  return withTenant(tenantId, async (tx) => {
    const [version] = await tx.insert(timetableVersions).values({ tenantId, createdBy: actorUserId, ...input }).returning();
    return version;
  });
}

async function assertDraft(tx: TenantTransaction, tenantId: string, versionId: string) {
  const [version] = await tx.select().from(timetableVersions).where(and(eq(timetableVersions.tenantId, tenantId), eq(timetableVersions.id, versionId))).limit(1);
  if (!version) throw new Phase4Error("Timetable version not found", 404);
  if (version.status !== "draft") throw new Phase4Error("Cannot modify a published timetable. Create a new draft version.", 403);
  return version;
}

export async function createSlot(tenantId: string, versionId: string, input: { sectionId: string; offeringId: string; staffId: string; roomId?: string | null; periodId: string; dayOfWeek: number }) {
  return withTenant(tenantId, async (tx) => {
    await assertDraft(tx, tenantId, versionId);
    try {
      const [slot] = await tx.insert(timetableSlots).values({ tenantId, versionId, ...input }).returning();
      return slot;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("section_period")) throw new Phase4Error("Section already has a class at this time", 409);
      if (message.includes("staff_period")) throw new Phase4Error("Teacher already assigned at this time", 409);
      if (message.includes("room_period")) throw new Phase4Error("Room already occupied at this time", 409);
      throw error;
    }
  });
}

export async function deleteSlot(tenantId: string, versionId: string, slotId: string) {
  return withTenant(tenantId, async (tx) => {
    await assertDraft(tx, tenantId, versionId);
    const [slot] = await tx.delete(timetableSlots).where(and(eq(timetableSlots.tenantId, tenantId), eq(timetableSlots.versionId, versionId), eq(timetableSlots.id, slotId))).returning();
    return slot;
  });
}

export async function publishVersion(tenantId: string, actorUserId: string, versionId: string) {
  return withTenant(tenantId, async (tx) => {
    const version = await assertDraft(tx, tenantId, versionId);
    const audit = await auditTimetableConflicts(tenantId, versionId);
    if (audit.hardConflicts.length > 0) throw new Phase4Error(`Cannot publish: resolve ${audit.hardConflicts.length} conflicts first`, 422);
    try {
      const [updated] = await tx.update(timetableVersions).set({ status: "published", publishedAt: new Date(), publishedBy: actorUserId, updatedAt: new Date() }).where(and(eq(timetableVersions.tenantId, tenantId), eq(timetableVersions.id, versionId))).returning();
      await tx.insert(auditLogs).values({ tenantId, actorUserId, action: "timetable.published", entityType: "timetable_version", entityId: version.id, metadata: { academicYearId: version.academicYearId } });
      return updated;
    } catch (error) {
      if (error instanceof Error && /published_per_year|duplicate key/i.test(error.message)) {
        throw new Phase4Error("Another timetable is already published for this academic year. Archive it first.", 409);
      }
      throw error;
    }
  });
}

export async function archiveVersion(tenantId: string, versionId: string) {
  return withTenant(tenantId, async (tx) => {
    const [version] = await tx.update(timetableVersions).set({ status: "archived", updatedAt: new Date() }).where(and(eq(timetableVersions.tenantId, tenantId), eq(timetableVersions.id, versionId))).returning();
    return version;
  });
}

export async function auditTimetableConflicts(tenantId: string, versionId: string) {
  const model = await listTimetableModel(tenantId, versionId);
  const warnings = [];
  for (const slot of model.slots) {
    const section = model.sections.find((item) => item.id === slot.sectionId);
    const room = model.rooms.find((item) => item.id === slot.roomId);
    if (room?.capacity && section?.capacity && room.capacity < section.capacity) {
      warnings.push({ slotId: slot.id, type: "room_capacity", message: `${room.name} capacity is below section capacity.` });
    }
  }
  return { hardConflicts: [], warnings };
}

export async function previewRollover(tenantId: string, fromYearId: string, toYearId: string) {
  if (fromYearId === toYearId) throw new Phase4Error("Target academic year must be different", 400);
  return withTenant(tenantId, async (tx) => {
    const enrollments = await tx.select({
      enrollmentId: studentEnrollments.id,
      studentId: students.id,
      studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`,
      currentClassId: academicClasses.id,
      currentClassName: academicClasses.name,
      currentSectionName: classSections.name,
      displayOrder: academicClasses.displayOrder,
      enrollmentStatus: studentEnrollments.enrollmentStatus,
    }).from(studentEnrollments)
      .innerJoin(students, eq(students.id, studentEnrollments.studentId))
      .innerJoin(academicClasses, eq(academicClasses.id, studentEnrollments.classId))
      .leftJoin(classSections, eq(classSections.id, studentEnrollments.sectionId))
      .where(and(eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.academicYearId, fromYearId), ne(studentEnrollments.enrollmentStatus, "withdrawn")));
    const targetClasses = await tx.select().from(academicClasses).where(and(eq(academicClasses.tenantId, tenantId), eq(academicClasses.academicYearId, toYearId))).orderBy(asc(academicClasses.displayOrder));
    const targetSections = await tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name));
    return enrollments.map((enrollment) => {
      const targetClass = targetClasses.find((item) => item.displayOrder > enrollment.displayOrder) ?? null;
      const classSectionsForTarget = targetClass ? targetSections.filter((section) => section.classId === targetClass.id) : [];
      const targetSection = classSectionsForTarget.find((section) => section.name === enrollment.currentSectionName) ?? classSectionsForTarget[0] ?? null;
      return {
        ...enrollment,
        proposedClassId: targetClass?.id ?? null,
        proposedClassName: targetClass?.name ?? null,
        proposedSectionId: targetSection?.id ?? null,
        proposedSectionName: targetSection?.name ?? null,
        status: targetClass ? "promote" : "graduating",
      };
    });
  });
}

export async function applyRollover(tenantId: string, actorUserId: string, fromYearId: string, toYearId: string) {
  const preview = await previewRollover(tenantId, fromYearId, toYearId);
  return withTenant(tenantId, async (tx) => {
    const [toYear] = await tx.select().from(academicYears).where(and(eq(academicYears.tenantId, tenantId), eq(academicYears.id, toYearId))).limit(1);
    if (!toYear) throw new Phase4Error("Target academic year not found", 404);
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const row of preview) {
      if (row.status !== "promote" || !row.proposedClassId) continue;
      const [existing] = await tx.select().from(studentEnrollments).where(and(eq(studentEnrollments.tenantId, tenantId), eq(studentEnrollments.studentId, row.studentId), eq(studentEnrollments.academicYearId, toYearId), ne(studentEnrollments.enrollmentStatus, "withdrawn"))).limit(1);
      if (existing) {
        skipped++;
        continue;
      }
      try {
        await tx.insert(studentEnrollments).values({ tenantId, studentId: row.studentId, academicYear: toYear.name, academicYearId: toYearId, classId: row.proposedClassId, sectionId: row.proposedSectionId, enrollmentStatus: "active", status: "active", promotionBasis: "rollover", enrolledOn: new Date().toISOString().slice(0, 10) });
        created++;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Unknown rollover error");
      }
    }
    await tx.insert(auditLogs).values({ tenantId, actorUserId, action: "academics.rollover.applied", entityType: "academic_year", entityId: toYearId, metadata: { fromYearId, toYearId, created, skipped } });
    return { created, skipped, errors };
  });
}

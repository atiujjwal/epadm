import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, asc, desc, eq, isNull, ne, sql } from "drizzle-orm";
import {
  academicClasses,
  academicTerms,
  academicYears,
  assessmentPlanComponents,
  assessmentPlans,
  assessmentTypes,
  attendance,
  auditLogs,
  classSections,
  curriculumOfferings,
  examEvents,
  examMarks,
  gradeScaleBands,
  gradeScales,
  gradebookColumns,
  gradebookEntries,
  reportCardGenerations,
  reportCardTemplates,
  staffProfiles,
  studentEnrollments,
  studentResults,
  students,
  subjects,
  tenants,
} from "@/lib/db";
import { type TenantTransaction, withTenant } from "@/lib/rls";

export class Phase6Error extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);
  const maybe = error as {
    message?: unknown;
    code?: unknown;
    constraint?: unknown;
    detail?: unknown;
    cause?: unknown;
  };
  return [
    typeof maybe.message === "string" ? maybe.message : "",
    typeof maybe.code === "string" ? maybe.code : "",
    typeof maybe.constraint === "string" ? maybe.constraint : "",
    typeof maybe.detail === "string" ? maybe.detail : "",
    maybe.cause ? errorText(maybe.cause) : "",
  ].filter(Boolean).join(" ");
}

export function phase6ApiError(error: unknown) {
  if (error instanceof Phase6Error) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (/23505|duplicate key|unique constraint/i.test(errorText(error))) {
    return Response.json({ error: "A conflicting assessment record already exists." }, { status: 409 });
  }
  return Response.json({ error: "Assessment request failed" }, { status: 500 });
}

const DEFAULT_TYPES = [
  { name: "Formative Assessment 1", code: "FA1", category: "exam", description: "Formative assessment component" },
  { name: "Summative Assessment 1", code: "SA1", category: "exam", description: "Summative assessment component" },
  { name: "Project", code: "PROJECT", category: "project", description: "Project or practical work" },
  { name: "Gradebook", code: "GRADEBOOK", category: "gradebook", description: "Continuous assessment from gradebook columns" },
] as const;

const CBSE_BANDS = [
  ["A1", "91.00", "100.00", "10.00", "Outstanding", true],
  ["A2", "81.00", "90.99", "9.00", "Excellent", true],
  ["B1", "71.00", "80.99", "8.00", "Very good", true],
  ["B2", "61.00", "70.99", "7.00", "Good", true],
  ["C1", "51.00", "60.99", "6.00", "Satisfactory", true],
  ["C2", "41.00", "50.99", "5.00", "Developing", true],
  ["D", "33.00", "40.99", "4.00", "Pass", true],
  ["E", "0.00", "32.99", "0.00", "Needs improvement", false],
] as const;

export const DEFAULT_REPORT_CARD_CONFIG = {
  showSchoolLogo: true,
  showSchoolName: true,
  showSchoolAddress: true,
  headerTitle: "REPORT CARD",
  showPhoto: false,
  showAdmissionNumber: true,
  showDateOfBirth: true,
  showClass: true,
  showSection: true,
  showHouse: true,
  showSubjectCode: true,
  showMaxMarks: true,
  showMarksObtained: true,
  showPercentage: true,
  showGrade: true,
  showRank: true,
  showAttendanceRow: true,
  classTeacherLabel: "Class Teacher",
  principalLabel: "Principal",
  showSignatureLines: true,
  watermarkText: "",
  primaryColor: "#1f4f46",
  accentColor: "#e8b44f",
};

function n(value: string | number | null | undefined) {
  return value == null ? 0 : Number(value);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function ensureAssessmentDefaults(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    for (const type of DEFAULT_TYPES) {
      await tx.insert(assessmentTypes).values({ tenantId, ...type }).onConflictDoNothing({
        target: [assessmentTypes.tenantId, assessmentTypes.code],
      });
    }

    let [scale] = await tx
      .select()
      .from(gradeScales)
      .where(and(eq(gradeScales.tenantId, tenantId), eq(gradeScales.isDefault, true)))
      .limit(1);
    if (!scale) {
      [scale] = await tx
        .insert(gradeScales)
        .values({ tenantId, name: "CBSE Grading Scale", isDefault: true })
        .returning();
    }
    for (const [gradeLabel, minPercent, maxPercent, gradePoint, remark, isPass] of CBSE_BANDS) {
      await tx.insert(gradeScaleBands).values({
        tenantId,
        scaleId: scale.id,
        gradeLabel,
        minPercent,
        maxPercent,
        gradePoint,
        remark,
        isPass,
        displayOrder: CBSE_BANDS.findIndex((band) => band[0] === gradeLabel),
      }).onConflictDoNothing({ target: [gradeScaleBands.scaleId, gradeScaleBands.gradeLabel] });
    }

    await tx.insert(reportCardTemplates).values({
      tenantId,
      name: "Default Report Card",
      isDefault: true,
      config: DEFAULT_REPORT_CARD_CONFIG,
    }).onConflictDoNothing();
  });
}

export async function listAssessmentModel(tenantId: string) {
  await ensureAssessmentDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [
      types,
      plans,
      components,
      scales,
      bands,
      events,
      templates,
      generations,
      years,
      terms,
      classes,
      sections,
      offerings,
      subjectRows,
      staffRows,
    ] = await Promise.all([
      tx.select().from(assessmentTypes).where(eq(assessmentTypes.tenantId, tenantId)).orderBy(asc(assessmentTypes.code)),
      tx.select().from(assessmentPlans).where(eq(assessmentPlans.tenantId, tenantId)).orderBy(desc(assessmentPlans.createdAt)),
      tx.select().from(assessmentPlanComponents).where(eq(assessmentPlanComponents.tenantId, tenantId)).orderBy(asc(assessmentPlanComponents.displayOrder)),
      tx.select().from(gradeScales).where(eq(gradeScales.tenantId, tenantId)).orderBy(desc(gradeScales.isDefault), asc(gradeScales.name)),
      tx.select().from(gradeScaleBands).where(eq(gradeScaleBands.tenantId, tenantId)).orderBy(asc(gradeScaleBands.displayOrder)),
      tx.select().from(examEvents).where(eq(examEvents.tenantId, tenantId)).orderBy(desc(examEvents.examDate)),
      tx.select().from(reportCardTemplates).where(eq(reportCardTemplates.tenantId, tenantId)).orderBy(desc(reportCardTemplates.isDefault), asc(reportCardTemplates.name)),
      tx.select().from(reportCardGenerations).where(eq(reportCardGenerations.tenantId, tenantId)).orderBy(desc(reportCardGenerations.createdAt)),
      tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.isCurrent), desc(academicYears.startDate)),
      tx.select().from(academicTerms).where(eq(academicTerms.tenantId, tenantId)).orderBy(asc(academicTerms.displayOrder)),
      tx.select().from(academicClasses).where(eq(academicClasses.tenantId, tenantId)).orderBy(asc(academicClasses.displayOrder), asc(academicClasses.name)),
      tx.select().from(classSections).where(eq(classSections.tenantId, tenantId)).orderBy(asc(classSections.name)),
      tx.select().from(curriculumOfferings).where(eq(curriculumOfferings.tenantId, tenantId)),
      tx.select().from(subjects).where(eq(subjects.tenantId, tenantId)).orderBy(asc(subjects.name)),
      tx.select().from(staffProfiles).where(eq(staffProfiles.tenantId, tenantId)).orderBy(asc(staffProfiles.fullName)),
    ]);
    return { types, plans, components, scales, bands, events, templates, generations, years, terms, classes, sections, offerings, subjects: subjectRows, staff: staffRows };
  });
}

export async function createAssessmentPlan(tenantId: string, input: {
  academicYearId: string;
  termId?: string | null;
  name: string;
  appliesToClass?: string | null;
  maxMarks?: string;
  components?: Array<{ assessmentTypeId: string; weightPercent: string; maxMarks: string; isGradebookSource?: boolean; displayOrder?: number }>;
}) {
  await ensureAssessmentDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [plan] = await tx.insert(assessmentPlans).values({
      tenantId,
      academicYearId: input.academicYearId,
      termId: input.termId ?? null,
      name: input.name,
      appliesToClass: input.appliesToClass ?? null,
      maxMarks: input.maxMarks ?? "100.00",
    }).returning();
    if (input.components?.length) {
      await tx.insert(assessmentPlanComponents).values(input.components.map((component, index) => ({
        tenantId,
        planId: plan.id,
        assessmentTypeId: component.assessmentTypeId,
        weightPercent: component.weightPercent,
        maxMarks: component.maxMarks,
        isGradebookSource: component.isGradebookSource ?? false,
        displayOrder: component.displayOrder ?? index + 1,
      })));
    }
    return plan;
  });
}

export async function upsertPlanComponent(tenantId: string, input: {
  planId: string;
  assessmentTypeId: string;
  weightPercent: string;
  maxMarks: string;
  isGradebookSource?: boolean;
  displayOrder?: number;
}) {
  return withTenant(tenantId, async (tx) => {
    const [component] = await tx.insert(assessmentPlanComponents).values({
      tenantId,
      ...input,
      isGradebookSource: input.isGradebookSource ?? false,
      displayOrder: input.displayOrder ?? 1,
    }).onConflictDoUpdate({
      target: [assessmentPlanComponents.planId, assessmentPlanComponents.assessmentTypeId],
      set: {
        weightPercent: input.weightPercent,
        maxMarks: input.maxMarks,
        isGradebookSource: input.isGradebookSource ?? false,
        displayOrder: input.displayOrder ?? 1,
      },
    }).returning();
    return component;
  });
}

async function assertPlanWeights(tx: TenantTransaction, tenantId: string, planId: string) {
  const components = await tx.select().from(assessmentPlanComponents).where(and(eq(assessmentPlanComponents.tenantId, tenantId), eq(assessmentPlanComponents.planId, planId)));
  const total = components.reduce((sum, component) => sum + n(component.weightPercent), 0);
  if (components.length === 0) throw new Phase6Error("Assessment plan must have at least one component.", 422);
  if (Math.abs(total - 100) > 0.01) {
    throw new Phase6Error(`Plan components must total 100% (currently ${round2(total)}%).`, 422);
  }
  return components;
}

export async function activateAssessmentPlan(tenantId: string, planId: string) {
  return withTenant(tenantId, async (tx) => {
    await assertPlanWeights(tx, tenantId, planId);
    const [plan] = await tx.update(assessmentPlans).set({ status: "active", updatedAt: new Date() }).where(and(eq(assessmentPlans.tenantId, tenantId), eq(assessmentPlans.id, planId))).returning();
    return plan;
  });
}

export async function createExamEvent(tenantId: string, actorUserId: string, input: {
  academicYearId: string;
  planId: string;
  assessmentTypeId: string;
  offeringId: string;
  sectionId: string;
  examDate: string;
  startTime?: string | null;
  durationMinutes?: number | null;
  roomId?: string | null;
  invigilatorId?: string | null;
  maxMarks: string;
  passingMarks?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    try {
      const [event] = await tx.insert(examEvents).values({ tenantId, createdBy: actorUserId, status: "scheduled", ...input }).returning();
      const enrolled = await tx.select({ studentId: studentEnrollments.studentId }).from(studentEnrollments).where(and(
        eq(studentEnrollments.tenantId, tenantId),
        eq(studentEnrollments.sectionId, input.sectionId),
        eq(studentEnrollments.academicYearId, input.academicYearId),
        eq(studentEnrollments.enrollmentStatus, "active"),
      ));
      if (enrolled.length > 0) {
        await tx.insert(examMarks).values(enrolled.map((row) => ({ tenantId, examEventId: event.id, studentId: row.studentId }))).onConflictDoNothing();
      }
      return { event, markStubsCreated: enrolled.length };
    } catch (error) {
      if (/23505|exam_events_type_offering_section_date_unique|duplicate key/i.test(errorText(error))) {
        throw new Phase6Error("An exam event already exists for this assessment, subject, section, and date.", 409);
      }
      throw error;
    }
  });
}

export async function listMarksForEvent(tenantId: string, eventId: string) {
  return withTenant(tenantId, async (tx) =>
    tx.select({
      markId: examMarks.id,
      studentId: students.id,
      studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`,
      admissionNumber: students.admissionNumber,
      marksObtained: examMarks.marksObtained,
      isAbsent: examMarks.isAbsent,
      isExempt: examMarks.isExempt,
      remarks: examMarks.remarks,
    }).from(examMarks)
      .innerJoin(students, eq(students.id, examMarks.studentId))
      .where(and(eq(examMarks.tenantId, tenantId), eq(examMarks.examEventId, eventId)))
      .orderBy(asc(students.admissionNumber)),
  );
}

async function getEventOrThrow(tx: TenantTransaction, tenantId: string, eventId: string) {
  const [event] = await tx.select().from(examEvents).where(and(eq(examEvents.tenantId, tenantId), eq(examEvents.id, eventId))).limit(1);
  if (!event) throw new Phase6Error("Exam event not found.", 404);
  return event;
}

export async function saveExamMarks(tenantId: string, actorUserId: string, eventId: string, rows: Array<{ studentId: string; marksObtained?: string | null; isAbsent?: boolean; isExempt?: boolean; remarks?: string | null }>) {
  return withTenant(tenantId, async (tx) => {
    const event = await getEventOrThrow(tx, tenantId, eventId);
    if (event.marksFinalized) throw new Phase6Error("Finalized marks cannot be edited.", 403);
    for (const row of rows) {
      const markValue = row.marksObtained == null || row.marksObtained === "" ? null : row.marksObtained;
      if (markValue != null && n(markValue) > n(event.maxMarks)) {
        throw new Phase6Error(`Marks for student ${row.studentId} exceed max marks ${event.maxMarks}.`, 422);
      }
      await tx.insert(examMarks).values({
        tenantId,
        examEventId: eventId,
        studentId: row.studentId,
        marksObtained: row.isAbsent || row.isExempt ? null : markValue,
        isAbsent: row.isAbsent ?? false,
        isExempt: row.isExempt ?? false,
        remarks: row.remarks ?? null,
        enteredBy: actorUserId,
        enteredAt: new Date(),
      }).onConflictDoUpdate({
        target: [examMarks.examEventId, examMarks.studentId],
        set: {
          marksObtained: row.isAbsent || row.isExempt ? null : markValue,
          isAbsent: row.isAbsent ?? false,
          isExempt: row.isExempt ?? false,
          remarks: row.remarks ?? null,
          enteredBy: actorUserId,
          enteredAt: new Date(),
          verifiedBy: null,
          verifiedAt: null,
        },
      });
    }
    return { updated: rows.length };
  });
}

export async function finalizeExamMarks(tenantId: string, actorUserId: string, eventId: string) {
  return withTenant(tenantId, async (tx) => {
    await getEventOrThrow(tx, tenantId, eventId);
    const missing = await tx.select({
      studentId: examMarks.studentId,
      studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`,
    }).from(examMarks)
      .innerJoin(students, eq(students.id, examMarks.studentId))
      .where(and(eq(examMarks.tenantId, tenantId), eq(examMarks.examEventId, eventId), isNull(examMarks.marksObtained), eq(examMarks.isAbsent, false), eq(examMarks.isExempt, false)));
    if (missing.length > 0) {
      throw new Phase6Error(`Missing marks for ${missing.map((row) => row.studentName.trim()).join(", ")}.`, 422);
    }
    const [event] = await tx.update(examEvents).set({ marksFinalized: true, status: "marks_entered" }).where(and(eq(examEvents.tenantId, tenantId), eq(examEvents.id, eventId))).returning();
    await tx.update(examMarks).set({ verifiedBy: actorUserId, verifiedAt: new Date() }).where(and(eq(examMarks.tenantId, tenantId), eq(examMarks.examEventId, eventId)));
    return event;
  });
}

async function gradeForPercent(tx: TenantTransaction, tenantId: string, percentage: number) {
  const [band] = await tx.select({
    gradeLabel: gradeScaleBands.gradeLabel,
    gradePoint: gradeScaleBands.gradePoint,
    isPass: gradeScaleBands.isPass,
  }).from(gradeScaleBands)
    .innerJoin(gradeScales, eq(gradeScales.id, gradeScaleBands.scaleId))
    .where(and(eq(gradeScales.tenantId, tenantId), eq(gradeScales.isDefault, true), sql`${percentage} >= ${gradeScaleBands.minPercent}`, sql`${percentage} <= ${gradeScaleBands.maxPercent}`))
    .orderBy(asc(gradeScaleBands.displayOrder))
    .limit(1);
  return band;
}

async function componentPercent(tx: TenantTransaction, tenantId: string, component: typeof assessmentPlanComponents.$inferSelect, offeringId: string, sectionId: string, studentId: string) {
  if (component.isGradebookSource) {
    const rows = await tx.select({
      marksObtained: gradebookEntries.marksObtained,
      maxMarks: gradebookColumns.maxMarks,
      isAbsent: gradebookEntries.isAbsent,
      isExempt: gradebookEntries.isExempt,
    }).from(gradebookColumns)
      .innerJoin(gradebookEntries, eq(gradebookEntries.columnId, gradebookColumns.id))
      .where(and(
        eq(gradebookColumns.tenantId, tenantId),
        eq(gradebookColumns.offeringId, offeringId),
        eq(gradebookColumns.sectionId, sectionId),
        eq(gradebookColumns.assessmentTypeId, component.assessmentTypeId),
        eq(gradebookEntries.studentId, studentId),
      ));
    const scored = rows.filter((row) => !row.isAbsent && !row.isExempt && row.marksObtained != null && n(row.maxMarks) > 0);
    if (scored.length === 0) return null;
    return scored.reduce((sum, row) => sum + (n(row.marksObtained) / n(row.maxMarks)) * 100, 0) / scored.length;
  }

  const rows = await tx.select({
    marksObtained: examMarks.marksObtained,
    maxMarks: examEvents.maxMarks,
    isAbsent: examMarks.isAbsent,
    isExempt: examMarks.isExempt,
  }).from(examEvents)
    .innerJoin(examMarks, eq(examMarks.examEventId, examEvents.id))
    .where(and(
      eq(examEvents.tenantId, tenantId),
      eq(examEvents.planId, component.planId),
      eq(examEvents.assessmentTypeId, component.assessmentTypeId),
      eq(examEvents.offeringId, offeringId),
      eq(examEvents.sectionId, sectionId),
      eq(examEvents.marksFinalized, true),
      eq(examMarks.studentId, studentId),
    ));
  const scored = rows.filter((row) => !row.isAbsent && !row.isExempt && row.marksObtained != null && n(row.maxMarks) > 0);
  if (scored.length === 0) return null;
  return scored.reduce((sum, row) => sum + (n(row.marksObtained) / n(row.maxMarks)) * 100, 0) / scored.length;
}

export async function computePlanResults(tenantId: string, planId: string, sectionId: string) {
  await ensureAssessmentDefaults(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [plan] = await tx.select().from(assessmentPlans).where(and(eq(assessmentPlans.tenantId, tenantId), eq(assessmentPlans.id, planId))).limit(1);
    if (!plan) throw new Phase6Error("Assessment plan not found.", 404);
    const components = await assertPlanWeights(tx, tenantId, planId);
    const [section] = await tx.select().from(classSections).where(and(eq(classSections.tenantId, tenantId), eq(classSections.id, sectionId))).limit(1);
    if (!section) throw new Phase6Error("Section not found.", 404);
    const classId = plan.appliesToClass ?? section.classId;
    const enrolled = await tx.select({ studentId: studentEnrollments.studentId }).from(studentEnrollments).where(and(
      eq(studentEnrollments.tenantId, tenantId),
      eq(studentEnrollments.sectionId, sectionId),
      eq(studentEnrollments.academicYearId, plan.academicYearId),
      ne(studentEnrollments.enrollmentStatus, "withdrawn"),
    ));
    const offerings = await tx.select().from(curriculumOfferings).where(and(
      eq(curriculumOfferings.tenantId, tenantId),
      eq(curriculumOfferings.academicYearId, plan.academicYearId),
      eq(curriculumOfferings.classId, classId),
    ));

    let computed = 0;
    let skipped = 0;
    for (const offering of offerings) {
      for (const enrollment of enrolled) {
        let weightedSum = 0;
        let totalWeight = 0;
        for (const component of components) {
          const percent = await componentPercent(tx, tenantId, component, offering.id, sectionId, enrollment.studentId);
          if (percent == null) continue;
          const weight = n(component.weightPercent);
          weightedSum += percent * weight;
          totalWeight += weight;
        }
        if (totalWeight === 0) {
          skipped++;
          continue;
        }
        const percentage = round2(weightedSum / totalWeight);
        const grade = await gradeForPercent(tx, tenantId, percentage);
        await tx.insert(studentResults).values({
          tenantId,
          studentId: enrollment.studentId,
          academicYearId: plan.academicYearId,
          termId: plan.termId,
          planId,
          offeringId: offering.id,
          sectionId,
          totalMarksObtained: String(round2((percentage / 100) * n(plan.maxMarks))),
          totalMarksMax: plan.maxMarks,
          percentage: String(percentage),
          gradeLabel: grade?.gradeLabel ?? null,
          gradePoint: grade?.gradePoint ?? null,
          isPass: grade?.isPass ?? false,
          computedAt: new Date(),
          isPublished: false,
          publishedAt: null,
        }).onConflictDoUpdate({
          target: [studentResults.studentId, studentResults.planId, studentResults.offeringId],
          set: {
            totalMarksObtained: String(round2((percentage / 100) * n(plan.maxMarks))),
            totalMarksMax: plan.maxMarks,
            percentage: String(percentage),
            gradeLabel: grade?.gradeLabel ?? null,
            gradePoint: grade?.gradePoint ?? null,
            isPass: grade?.isPass ?? false,
            computedAt: new Date(),
            isPublished: false,
            publishedAt: null,
          },
        });
        computed++;
      }
      await computeRanks(tx, tenantId, planId, sectionId, offering.id);
    }
    return { computed, skipped, errors: [] as string[] };
  });
}

async function computeRanks(tx: TenantTransaction, tenantId: string, planId: string, sectionId: string, offeringId: string) {
  const rows = await tx.select().from(studentResults).where(and(
    eq(studentResults.tenantId, tenantId),
    eq(studentResults.planId, planId),
    eq(studentResults.sectionId, sectionId),
    eq(studentResults.offeringId, offeringId),
  )).orderBy(desc(studentResults.percentage));
  let rank = 0;
  let previous: number | null = null;
  for (let index = 0; index < rows.length; index++) {
    const current = n(rows[index].percentage);
    if (previous === null || current !== previous) rank = index + 1;
    previous = current;
    await tx.update(studentResults).set({ classRank: rank }).where(eq(studentResults.id, rows[index].id));
  }
}

export async function listSectionResults(tenantId: string, planId: string, sectionId: string) {
  return withTenant(tenantId, async (tx) =>
    tx.select({
      resultId: studentResults.id,
      studentId: students.id,
      studentName: sql<string>`concat(${students.firstName}, ' ', coalesce(${students.lastName}, ''))`,
      admissionNumber: students.admissionNumber,
      offeringId: studentResults.offeringId,
      subjectId: curriculumOfferings.subjectId,
      subjectName: subjects.name,
      percentage: studentResults.percentage,
      gradeLabel: studentResults.gradeLabel,
      classRank: studentResults.classRank,
      isPass: studentResults.isPass,
      isPublished: studentResults.isPublished,
    }).from(studentResults)
      .innerJoin(students, eq(students.id, studentResults.studentId))
      .innerJoin(curriculumOfferings, eq(curriculumOfferings.id, studentResults.offeringId))
      .innerJoin(subjects, eq(subjects.id, curriculumOfferings.subjectId))
      .where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.planId, planId), eq(studentResults.sectionId, sectionId)))
      .orderBy(asc(studentResults.classRank), asc(students.firstName)),
  );
}

export async function publishResults(tenantId: string, actorUserId: string, planId: string, sectionId: string) {
  return withTenant(tenantId, async (tx) => {
    const pending = await tx.select({
      eventId: examEvents.id,
      subjectName: subjects.name,
      typeCode: assessmentTypes.code,
    }).from(examEvents)
      .innerJoin(curriculumOfferings, eq(curriculumOfferings.id, examEvents.offeringId))
      .innerJoin(subjects, eq(subjects.id, curriculumOfferings.subjectId))
      .innerJoin(assessmentTypes, eq(assessmentTypes.id, examEvents.assessmentTypeId))
      .where(and(eq(examEvents.tenantId, tenantId), eq(examEvents.planId, planId), eq(examEvents.sectionId, sectionId), eq(examEvents.marksFinalized, false)));
    if (pending.length > 0) {
      const first = pending[0];
      throw new Phase6Error(`Marks not finalized for ${first.subjectName} - ${first.typeCode}.`, 422);
    }
    const existing = await tx.select({ id: studentResults.id }).from(studentResults).where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.planId, planId), eq(studentResults.sectionId, sectionId))).limit(1);
    if (existing.length === 0) throw new Phase6Error("Compute results before publishing.", 422);
    await tx.update(studentResults).set({ isPublished: true, publishedAt: new Date() }).where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.planId, planId), eq(studentResults.sectionId, sectionId)));
    await tx.insert(auditLogs).values({ tenantId, actorUserId, action: "assessments.results.published", entityType: "assessment_plan", entityId: planId, metadata: { sectionId } });
    return { published: true };
  });
}

export async function unpublishResults(tenantId: string, actorUserId: string, planId: string, sectionId: string) {
  return withTenant(tenantId, async (tx) => {
    await tx.update(studentResults).set({ isPublished: false, publishedAt: null }).where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.planId, planId), eq(studentResults.sectionId, sectionId)));
    await tx.insert(auditLogs).values({ tenantId, actorUserId, action: "assessments.results.unpublished", entityType: "assessment_plan", entityId: planId, metadata: { sectionId } });
    return { unpublished: true };
  });
}

export async function upsertReportCardTemplate(tenantId: string, input: { id?: string; name: string; planId?: string | null; isDefault?: boolean; config?: Record<string, unknown> }) {
  return withTenant(tenantId, async (tx) => {
    if (input.isDefault) await tx.update(reportCardTemplates).set({ isDefault: false }).where(eq(reportCardTemplates.tenantId, tenantId));
    if (input.id) {
      const [template] = await tx.update(reportCardTemplates).set({ name: input.name, planId: input.planId ?? null, isDefault: input.isDefault ?? false, config: input.config ?? DEFAULT_REPORT_CARD_CONFIG, updatedAt: new Date() }).where(and(eq(reportCardTemplates.tenantId, tenantId), eq(reportCardTemplates.id, input.id))).returning();
      return template;
    }
    const [template] = await tx.insert(reportCardTemplates).values({ tenantId, name: input.name, planId: input.planId ?? null, isDefault: input.isDefault ?? false, config: input.config ?? DEFAULT_REPORT_CARD_CONFIG }).returning();
    return template;
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function pdfBytesFromText(text: string) {
  const safe = text.replace(/[()\\]/g, "\\$&").slice(0, 1800);
  const stream = `BT /F1 11 Tf 40 790 Td (${safe}) Tj ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(body.length);
    body += `${object}\n`;
  }
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body);
}

export async function generateReportCards(tenantId: string, actorUserId: string, input: { planId: string; sectionId: string; studentIds: string[]; templateId?: string | null }) {
  const rows = await listSectionResults(tenantId, input.planId, input.sectionId);
  const publishedIds = new Set(rows.filter((row) => row.isPublished).map((row) => row.studentId));
  const missing = input.studentIds.filter((id) => !publishedIds.has(id));
  if (missing.length > 0) throw new Phase6Error("Results must be published before generating report cards.", 422);

  return withTenant(tenantId, async (tx) => {
    const [school] = await tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    const [plan] = await tx.select().from(assessmentPlans).where(eq(assessmentPlans.id, input.planId)).limit(1);
    const [section] = await tx.select().from(classSections).where(eq(classSections.id, input.sectionId)).limit(1);
    const [klass] = section ? await tx.select().from(academicClasses).where(eq(academicClasses.id, section.classId)).limit(1) : [];
    const [template] = input.templateId
      ? await tx.select().from(reportCardTemplates).where(and(eq(reportCardTemplates.tenantId, tenantId), eq(reportCardTemplates.id, input.templateId))).limit(1)
      : await tx.select().from(reportCardTemplates).where(and(eq(reportCardTemplates.tenantId, tenantId), eq(reportCardTemplates.isDefault, true))).limit(1);
    const outputDir = path.join(process.cwd(), "generated-files", tenantId, "report-cards");
    await mkdir(outputDir, { recursive: true });
    let generated = 0;
    let failed = 0;

    for (const studentId of input.studentIds) {
      try {
        const [student] = await tx.select().from(students).where(and(eq(students.tenantId, tenantId), eq(students.id, studentId))).limit(1);
        if (!student) throw new Error("Student not found");
        const studentRows = rows.filter((row) => row.studentId === studentId);
        const present = await tx.select({ total: sql<number>`count(*)`, present: sql<number>`count(*) filter (where ${attendance.status} = 'present')` }).from(attendance).where(and(eq(attendance.tenantId, tenantId), eq(attendance.studentId, studentId)));
        const attendancePercent = present[0]?.total ? round2((Number(present[0].present) / Number(present[0].total)) * 100) : null;
        const fileName = `${student.firstName}_${student.lastName ?? ""}_${section?.name ?? "Section"}_${input.planId}.pdf`.replace(/[^A-Za-z0-9_.-]/g, "_");
        const pdfPath = path.join(outputDir, fileName);
        const text = [
          `${school?.name ?? "School"} - ${escapeHtml(template?.config?.["headerTitle"] ?? DEFAULT_REPORT_CARD_CONFIG.headerTitle)}`,
          `Student: ${student.firstName} ${student.lastName ?? ""}`,
          `Admission: ${student.admissionNumber}`,
          `Class: ${klass?.name ?? ""} ${section?.name ?? ""}`,
          `Plan: ${plan?.name ?? ""}`,
          `Attendance: ${attendancePercent ?? "N/A"}%`,
          ...studentRows.map((row) => `${row.subjectName}: ${row.percentage}% ${row.gradeLabel ?? ""} Rank ${row.classRank ?? ""}`),
        ].join("\n");
        await writeFile(pdfPath, pdfBytesFromText(text));
        const pdfUrl = `/generated-files/${tenantId}/report-cards/${fileName}`;
        await tx.insert(reportCardGenerations).values({
          tenantId,
          studentId,
          planId: input.planId,
          sectionId: input.sectionId,
          templateId: template?.id ?? null,
          pdfUrl,
          status: "complete",
          generatedBy: actorUserId,
          generatedAt: new Date(),
        }).onConflictDoUpdate({
          target: [reportCardGenerations.studentId, reportCardGenerations.planId],
          set: { templateId: template?.id ?? null, sectionId: input.sectionId, pdfUrl, status: "complete", errorMessage: null, generatedBy: actorUserId, generatedAt: new Date(), updatedAt: new Date() },
        });
        generated++;
      } catch (error) {
        failed++;
        await tx.insert(reportCardGenerations).values({ tenantId, studentId, planId: input.planId, sectionId: input.sectionId, templateId: template?.id ?? null, status: "failed", errorMessage: error instanceof Error ? error.message : "Unknown generation error", generatedBy: actorUserId }).onConflictDoNothing();
      }
    }
    return { generated, failed };
  });
}

export async function getStudentAssessmentSummary(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const recentMarks = await tx.select({
      markId: examMarks.id,
      marksObtained: examMarks.marksObtained,
      isAbsent: examMarks.isAbsent,
      isExempt: examMarks.isExempt,
      examDate: examEvents.examDate,
      maxMarks: examEvents.maxMarks,
      subjectName: subjects.name,
      assessmentType: assessmentTypes.code,
    }).from(examMarks)
      .innerJoin(examEvents, eq(examEvents.id, examMarks.examEventId))
      .innerJoin(curriculumOfferings, eq(curriculumOfferings.id, examEvents.offeringId))
      .innerJoin(subjects, eq(subjects.id, curriculumOfferings.subjectId))
      .innerJoin(assessmentTypes, eq(assessmentTypes.id, examEvents.assessmentTypeId))
      .where(and(eq(examMarks.tenantId, tenantId), eq(examMarks.studentId, studentId)))
      .orderBy(desc(examEvents.examDate))
      .limit(10);
    const results = await tx.select({
      resultId: studentResults.id,
      planName: assessmentPlans.name,
      subjectName: subjects.name,
      percentage: studentResults.percentage,
      gradeLabel: studentResults.gradeLabel,
      classRank: studentResults.classRank,
      isPass: studentResults.isPass,
      isPublished: studentResults.isPublished,
    }).from(studentResults)
      .innerJoin(assessmentPlans, eq(assessmentPlans.id, studentResults.planId))
      .innerJoin(curriculumOfferings, eq(curriculumOfferings.id, studentResults.offeringId))
      .innerJoin(subjects, eq(subjects.id, curriculumOfferings.subjectId))
      .where(and(eq(studentResults.tenantId, tenantId), eq(studentResults.studentId, studentId)))
      .orderBy(desc(studentResults.computedAt));
    const reportCards = await tx.select().from(reportCardGenerations).where(and(eq(reportCardGenerations.tenantId, tenantId), eq(reportCardGenerations.studentId, studentId), eq(reportCardGenerations.status, "complete"))).orderBy(desc(reportCardGenerations.generatedAt));
    return { recentMarks, results, reportCards };
  });
}

export async function importMarksCsv(tenantId: string, actorUserId: string, eventId: string, csv: string) {
  const rows = csv.split(/\r?\n/).slice(1).map((line) => line.split(",").map((cell) => cell.trim())).filter((cells) => cells.length >= 2 && cells[0]);
  return saveExamMarks(tenantId, actorUserId, eventId, rows.map(([studentId, marksObtained, status, remarks]) => ({ studentId, marksObtained, isAbsent: status === "absent", isExempt: status === "exempt", remarks })));
}

export const MARKS_CSV_TEMPLATE = "studentId,marksObtained,status,remarks\n";

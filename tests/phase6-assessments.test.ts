import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

vi.mock("server-only", () => ({}));

import {
  activateAssessmentPlan,
  computePlanResults,
  createAssessmentPlan,
  createExamEvent,
  ensureAssessmentDefaults,
  finalizeExamMarks,
  generateReportCards,
  listAssessmentModel,
  listSectionResults,
  publishResults,
  saveExamMarks,
} from "@/lib/phase6/assessments";

const TABLES = [
  "assessment_types",
  "assessment_plans",
  "assessment_plan_components",
  "grade_scales",
  "grade_scale_bands",
  "gradebook_columns",
  "gradebook_entries",
  "exam_events",
  "exam_marks",
  "student_results",
  "report_card_templates",
  "report_card_generations",
] as const;

const UNIQUE_INDEXES = [
  "grade_scales_one_default_per_tenant",
  "exam_marks_event_student_unique",
  "student_results_student_plan_offering_unique",
  "assessment_plans_one_active_class_scope",
  "assessment_plans_one_active_all_scope",
] as const;

const opsUrl = process.env.OPS_DATABASE_URL;
let ops: Pool;
const stamp = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const tenantId = randomUUID();
const userId = randomUUID();
let academicYearId = "";
let classId = "";
let sectionId = "";
let offeringId = "";
let studentA = "";
let studentB = "";
let studentC = "";
let studentD = "";

describe("Phase 6 assessment foundation", () => {
  beforeAll(async () => {
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    ops = new Pool({ connectionString: opsUrl, max: 1 });
    await ops.query("insert into tenants (id,name,slug,subscription_tier,is_active) values ($1,$2,$3,'basic',true)", [tenantId, "Phase 6 Tenant", `phase6-${stamp}`]);
    await ops.query("insert into users (id,name,email,password_hash,is_active) values ($1,'Phase 6 User',$2,'hash',true)", [userId, `phase6-${stamp}@example.test`]);
    const staffId = (await ops.query("insert into staff_profiles (tenant_id,employee_code,full_name,status) values ($1,$2,'Phase 6 Teacher','active') returning id", [tenantId, `P6T-${stamp}`])).rows[0].id;
    academicYearId = (await ops.query("insert into academic_years (tenant_id,name,start_date,end_date,is_current,status) values ($1,'2026-27','2026-04-01','2027-03-31',true,'active') returning id", [tenantId])).rows[0].id;
    classId = (await ops.query("insert into academic_classes (tenant_id,code,name,academic_year,academic_year_id,class_teacher_id,display_order) values ($1,'G10','Grade 10','2026-27',$2,$3,10) returning id", [tenantId, academicYearId, staffId])).rows[0].id;
    sectionId = (await ops.query("insert into class_sections (tenant_id,class_id,name,capacity) values ($1,$2,'A',40) returning id", [tenantId, classId])).rows[0].id;
    const subjectId = (await ops.query("insert into subjects (tenant_id,name,code,status) values ($1,'Mathematics',$2,'active') returning id", [tenantId, `MATH-${stamp}`])).rows[0].id;
    offeringId = (await ops.query("insert into curriculum_offerings (tenant_id,academic_year_id,class_id,subject_id,periods_per_week) values ($1,$2,$3,$4,5) returning id", [tenantId, academicYearId, classId, subjectId])).rows[0].id;
    const studentIds = [];
    for (const name of ["Asha", "Bala", "Chitra", "Dev"]) {
      const studentId = (await ops.query("insert into students (tenant_id,admission_number,first_name,status) values ($1,$2,$3,'active') returning id", [tenantId, `${name}-${stamp}`, name])).rows[0].id;
      studentIds.push(studentId);
      await ops.query("insert into student_enrollments (tenant_id,student_id,class_id,section_id,academic_year,academic_year_id,enrollment_status,status) values ($1,$2,$3,$4,'2026-27',$5,'active','active')", [tenantId, studentId, classId, sectionId, academicYearId]);
    }
    [studentA, studentB, studentC, studentD] = studentIds;
  });

  afterAll(async () => {
    if (ops) {
      await ops.query("delete from tenants where id = $1", [tenantId]).catch(() => undefined);
      await ops.query("delete from users where id = $1", [userId]).catch(() => undefined);
      await ops.end();
    }
    await rm(`generated-files/${tenantId}`, { recursive: true, force: true });
  });

  it("enables and forces tenant RLS on every new table and keeps key unique indexes", async () => {
    const rls = await ops.query(
      "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
      [TABLES],
    );
    expect(rls.rows).toHaveLength(TABLES.length);
    for (const row of rls.rows) {
      expect(row.relrowsecurity).toBe(true);
      expect(row.relforcerowsecurity).toBe(true);
      expect(row.policies).toBeGreaterThan(0);
    }
    const indexes = await ops.query("select indexname from pg_indexes where schemaname = 'public' and indexname = any($1::text[])", [UNIQUE_INDEXES]);
    expect(indexes.rows.map((row) => row.indexname).sort()).toEqual([...UNIQUE_INDEXES].sort());
  });

  it("validates plans, creates mark stubs, finalizes marks, computes weighted grades, ranks ties, and publishes", async () => {
    await ensureAssessmentDefaults(tenantId);
    const model = await listAssessmentModel(tenantId);
    const fa1 = model.types.find((type) => type.code === "FA1");
    const sa1 = model.types.find((type) => type.code === "SA1");
    expect(fa1).toBeTruthy();
    expect(sa1).toBeTruthy();

    const badPlan = await createAssessmentPlan(tenantId, {
      academicYearId,
      name: "Invalid Plan",
      appliesToClass: classId,
      components: [{ assessmentTypeId: fa1!.id, weightPercent: "50.00", maxMarks: "100.00" }],
    });
    await expect(activateAssessmentPlan(tenantId, badPlan.id)).rejects.toThrow(/total 100%/);

    const plan = await createAssessmentPlan(tenantId, {
      academicYearId,
      name: "Term 1 Assessment Plan",
      appliesToClass: classId,
      components: [
        { assessmentTypeId: fa1!.id, weightPercent: "30.00", maxMarks: "100.00" },
        { assessmentTypeId: sa1!.id, weightPercent: "70.00", maxMarks: "100.00" },
      ],
    });
    await activateAssessmentPlan(tenantId, plan.id);

    const faEvent = await createExamEvent(tenantId, userId, { academicYearId, planId: plan.id, assessmentTypeId: fa1!.id, offeringId, sectionId, examDate: "2026-07-10", maxMarks: "100.00" });
    expect(faEvent.markStubsCreated).toBe(4);
    await expect(createExamEvent(tenantId, userId, { academicYearId, planId: plan.id, assessmentTypeId: fa1!.id, offeringId, sectionId, examDate: "2026-07-10", maxMarks: "100.00" })).rejects.toThrow(/already exists/);
    const saEvent = await createExamEvent(tenantId, userId, { academicYearId, planId: plan.id, assessmentTypeId: sa1!.id, offeringId, sectionId, examDate: "2026-08-10", maxMarks: "100.00" });

    await saveExamMarks(tenantId, userId, faEvent.event.id, [
      { studentId: studentA, marksObtained: "60.00" },
      { studentId: studentB, marksObtained: "90.00" },
      { studentId: studentC, marksObtained: "80.00" },
      { studentId: studentD, marksObtained: "80.00" },
    ]);
    await finalizeExamMarks(tenantId, userId, faEvent.event.id);
    await expect(publishResults(tenantId, userId, plan.id, sectionId)).rejects.toThrow(/Marks not finalized/);
    await expect(saveExamMarks(tenantId, userId, saEvent.event.id, [{ studentId: studentA, marksObtained: "101.00" }])).rejects.toThrow(/exceed max marks/);
    await expect(finalizeExamMarks(tenantId, userId, saEvent.event.id)).rejects.toThrow(/Missing marks/);
    await saveExamMarks(tenantId, userId, saEvent.event.id, [
      { studentId: studentA, marksObtained: "80.00" },
      { studentId: studentB, marksObtained: "90.00" },
      { studentId: studentC, marksObtained: "80.00" },
      { studentId: studentD, marksObtained: "80.00" },
    ]);
    await finalizeExamMarks(tenantId, userId, saEvent.event.id);

    const computed = await computePlanResults(tenantId, plan.id, sectionId);
    expect(computed.computed).toBe(4);
    const results = await listSectionResults(tenantId, plan.id, sectionId);
    const byStudent = new Map(results.map((row) => [row.studentId, row]));
    expect(Number(byStudent.get(studentA)?.percentage)).toBe(74);
    expect(byStudent.get(studentB)?.classRank).toBe(1);
    expect(byStudent.get(studentC)?.classRank).toBe(2);
    expect(byStudent.get(studentD)?.classRank).toBe(2);
    expect(byStudent.get(studentA)?.classRank).toBe(4);
    await expect(publishResults(tenantId, userId, plan.id, sectionId)).resolves.toEqual({ published: true });

    const generated = await generateReportCards(tenantId, userId, { planId: plan.id, sectionId, studentIds: [studentA] });
    expect(generated.generated).toBe(1);
    expect(generated.failed).toBe(0);
    const generationRows = await ops.query("select status, pdf_url from report_card_generations where tenant_id = $1 and student_id = $2 and plan_id = $3", [tenantId, studentA, plan.id]);
    expect(generationRows.rows[0].status).toBe("complete");
    expect(generationRows.rows[0].pdf_url).toMatch(/^\/generated-files\/.+\.pdf$/);
  });
});

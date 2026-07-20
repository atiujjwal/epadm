import {
  getAcademicStructureSummary,
  listClasses,
  listEnrollments,
  listSections,
} from "@/lib/admin/academic-structure";
import { listStaff, listStudents } from "@/lib/admin/registries";
import { listSubjects } from "@/lib/admin/subjects";
import { getCtx } from "@/lib/context";
import { AcademicsWorkspace } from "./academics-workspace";

export default async function AcademicsPage() {
  const ctx = await getCtx();
  const [classes, sections, enrollments, staff, students, subjects, summary] = await Promise.all([
    listClasses(ctx.tenantId),
    listSections(ctx.tenantId),
    listEnrollments(ctx.tenantId),
    listStaff(ctx.tenantId),
    listStudents(ctx.tenantId),
    listSubjects(ctx.tenantId),
    getAcademicStructureSummary(ctx.tenantId),
  ]);

  const staffOptions = staff.map((member) => ({
    id: member.id,
    label: `${member.fullName} (${member.employeeCode})`,
  }));

  const studentOptions = students.map((student) => ({
    id: student.id,
    label: `${student.firstName} ${student.lastName ?? ""}`.trim(),
    admissionNumber: student.admissionNumber,
  }));

  return (
    <AcademicsWorkspace
      classes={classes}
      sections={sections}
      enrollments={enrollments}
      staffOptions={staffOptions}
      studentOptions={studentOptions}
      subjects={subjects}
      summary={{
        classCount: summary.classCount,
        sectionCount: summary.sectionCount,
        enrollmentCount: enrollments.length,
        subjectCount: subjects.length,
      }}
    />
  );
}

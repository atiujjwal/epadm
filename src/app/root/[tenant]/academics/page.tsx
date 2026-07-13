import {
  getAcademicStructureSummary,
  listClasses,
  listEnrollments,
  listSections,
} from "@/lib/admin/academic-structure";
import { listStaff, listStudents } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { AcademicStructureWorkspace } from "./academic-structure-workspace";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default async function AcademicsPage() {
  const ctx = await getCtx();
  const [summary, classes, sections, enrollments, students, staff] = await Promise.all([
    getAcademicStructureSummary(ctx.tenantId),
    listClasses(ctx.tenantId),
    listSections(ctx.tenantId),
    listEnrollments(ctx.tenantId),
    listStudents(ctx.tenantId),
    listStaff(ctx.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academics"
        description="Define classes, organize sections, and map students into academic structure."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Classes</div>
          <div className="mt-2 text-3xl font-semibold text-primary">{summary.classCount}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Sections</div>
          <div className="mt-2 text-3xl font-semibold text-primary">{summary.sectionCount}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Enrollments</div>
          <div className="mt-2 text-3xl font-semibold text-primary">{summary.enrollmentCount}</div>
        </Card>
      </section>

      <AcademicStructureWorkspace
        initialClasses={classes.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        initialSections={sections.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        initialEnrollments={enrollments.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        students={students.map((student) => ({
          id: student.id,
          label: `${student.firstName} ${student.lastName ?? ""}`.trim(),
          admissionNumber: student.admissionNumber,
        }))}
        staff={staff.map((member) => ({
          id: member.id,
          label: member.fullName,
        }))}
      />
    </div>
  );
}

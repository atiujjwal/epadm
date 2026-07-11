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
import { Badge } from "@/components/ui/badge";

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
      <section className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Classes</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{summary.classCount}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Sections</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{summary.sectionCount}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Enrollments</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{summary.enrollmentCount}</div>
        </Card>
      </section>

      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Academics</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Define classes, organize sections, and map students into academic structure.
        </p>
      </div>

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

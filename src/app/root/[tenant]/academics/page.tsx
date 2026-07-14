import {
  getAcademicStructureSummary,
  listClasses,
  listEnrollments,
  listSections,
} from "@/lib/admin/academic-structure";
import { listStaff, listStudents } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { AcademicStructureWorkspace } from "./academic-structure-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";

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

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          label="Classes"
          value={summary.classCount}
          colorScheme="indigo"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          label="Sections"
          value={summary.sectionCount}
          colorScheme="emerald"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
            </svg>
          }
          label="Enrollments"
          value={summary.enrollmentCount}
          colorScheme="amber"
        />
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

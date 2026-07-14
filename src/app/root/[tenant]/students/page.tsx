import { getStudentSummary, listStudents } from "@/lib/admin/registries";
import { StudentRegistry } from "./student-registry";
import { getCtx } from "@/lib/context";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";

export default async function StudentsPage() {
  const ctx = await getCtx();
  const [summary, students] = await Promise.all([
    getStudentSummary(ctx.tenantId),
    listStudents(ctx.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Maintain admission, classroom, and guardian records for daily school operations."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
            </svg>
          }
          label="Total students"
          value={summary.total}
          colorScheme="indigo"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          }
          label="Active"
          value={summary.active}
          colorScheme="emerald"
        />
        <MetricCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
          label="Non-active"
          value={summary.inactive}
          colorScheme="rose"
        />
      </section>

      <StudentRegistry
        initialStudents={students.map((student) => ({
          ...student,
          createdAt: student.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

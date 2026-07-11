import { getStudentSummary, listStudents } from "@/lib/admin/registries";
import { StudentRegistry } from "./student-registry";
import { getCtx } from "@/lib/context";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

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

      <section className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Total students</div>
          <div className="mt-2 text-3xl font-semibold text-primary">{summary.total}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Active</div>
          <div className="mt-2 text-3xl font-semibold text-accent">{summary.active}</div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Non-active</div>
          <div className="mt-2 text-3xl font-semibold text-secondary">{summary.inactive}</div>
        </Card>
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

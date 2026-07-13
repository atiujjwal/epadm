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

      <section className="grid gap-4 sm:grid-cols-3">
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--indigo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
            </svg>
          </div>
          <div className="stat-card__label">Total students</div>
          <div className="stat-card__value">{summary.total}</div>
        </Card>
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--emerald" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="stat-card__label">Active</div>
          <div className="stat-card__value">{summary.active}</div>
        </Card>
        <Card variant="elevated" padding="md" className="stat-card">
          <div className="stat-card__icon stat-card__icon--slate" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="stat-card__label">Non-active</div>
          <div className="stat-card__value">{summary.inactive}</div>
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

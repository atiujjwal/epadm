import { getStudentSummary, listStudents } from "@/lib/admin/registries";
import { StudentRegistry } from "./student-registry";
import { getCtx } from "@/lib/context";

export default async function StudentsPage() {
  const ctx = await getCtx();
  const [summary, students] = await Promise.all([
    getStudentSummary(ctx.tenantId),
    listStudents(ctx.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total students</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Active</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">{summary.active}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Non-active</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-700">{summary.inactive}</div>
        </div>
      </section>

      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Students</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Maintain admission, classroom, and guardian records for daily school operations.
        </p>
      </div>

      <StudentRegistry
        initialStudents={students.map((student) => ({
          ...student,
          createdAt: student.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

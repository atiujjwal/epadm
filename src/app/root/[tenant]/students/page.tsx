import { getStudentSummary, listStudents } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { StudentsWorkspace } from "./students-workspace";

export default async function StudentsPage() {
  const ctx = await getCtx();
  const [initialStudents, summary] = await Promise.all([
    listStudents(ctx.tenantId),
    getStudentSummary(ctx.tenantId),
  ]);

  return (
    <StudentsWorkspace
      initialStudents={initialStudents}
      total={summary.total}
      active={summary.active}
    />
  );
}

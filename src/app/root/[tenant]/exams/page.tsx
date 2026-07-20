import { listExams } from "@/lib/admin/exams";
import { getCtx } from "@/lib/context";
import { ExamsWorkspace } from "./exams-workspace";

export default async function ExamsPage() {
  const ctx = await getCtx();
  const exams = await listExams(ctx.tenantId);

  return <ExamsWorkspace initialExams={exams} />;
}

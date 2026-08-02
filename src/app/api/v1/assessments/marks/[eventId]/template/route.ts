import { requirePermission } from "@/lib/auth/guards";
import { MARKS_CSV_TEMPLATE } from "@/lib/phase6/assessments";

export async function GET() {
  await requirePermission("assessments.marks.write");
  return new Response(MARKS_CSV_TEMPLATE, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=marks-import-template.csv" } });
}

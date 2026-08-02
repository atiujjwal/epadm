import { requirePermission } from "@/lib/auth/guards";
import { STUDENT_TEMPLATE } from "@/lib/phase3/imports";
export async function GET() { await requirePermission("students.import"); return new Response(STUDENT_TEMPLATE, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=students-import-template.csv" } }); }

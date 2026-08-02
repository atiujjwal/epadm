import { requirePermission } from "@/lib/auth/guards";
import { STAFF_TEMPLATE } from "@/lib/phase3/imports";
export async function GET() { await requirePermission("hr.staff.import"); return new Response(STAFF_TEMPLATE, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=staff-import-template.csv" } }); }

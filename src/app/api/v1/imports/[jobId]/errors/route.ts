import { requireImportPermission } from "@/lib/phase3/import-access";
import { makeErrorCsv } from "@/lib/phase3/imports";
type Context = { params: Promise<{ jobId: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requireImportPermission(); const { jobId } = await params; return new Response(await makeErrorCsv(ctx.tenantId, jobId), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=import-${jobId}-errors.csv` } }); }

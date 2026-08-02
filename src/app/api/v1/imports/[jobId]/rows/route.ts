import { requireImportPermission } from "@/lib/phase3/import-access";
import { listImportRows } from "@/lib/phase3/imports";
type Context = { params: Promise<{ jobId: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requireImportPermission(); const { jobId } = await params; return Response.json({ rows: await listImportRows(ctx.tenantId, jobId) }); }

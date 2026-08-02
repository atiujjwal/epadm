import { requireImportPermission } from "@/lib/phase3/import-access";
import { getImportJob } from "@/lib/phase3/imports";
type Context = { params: Promise<{ jobId: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requireImportPermission(); const { jobId } = await params; const job = await getImportJob(ctx.tenantId, jobId); return job ? Response.json({ job }) : Response.json({ error: "Import job not found" }, { status: 404 }); }

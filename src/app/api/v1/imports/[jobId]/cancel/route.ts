import { requireImportPermission } from "@/lib/phase3/import-access";
import { cancelImport } from "@/lib/phase3/imports";
import { phase3ApiError } from "@/lib/phase3/api";
type Context = { params: Promise<{ jobId: string }> };
export async function POST(_request: Request, { params }: Context) { const ctx = await requireImportPermission(); const { jobId } = await params; try { return Response.json({ job: await cancelImport(ctx.tenantId, jobId) }); } catch (error) { return phase3ApiError(error); } }

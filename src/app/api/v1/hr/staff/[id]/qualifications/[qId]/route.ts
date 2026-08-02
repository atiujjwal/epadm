import { requirePermission } from "@/lib/auth/guards";
import { removeQualification } from "@/lib/phase3/hr";
import { phase3ApiError } from "@/lib/phase3/api";
type Context = { params: Promise<{ id: string; qId: string }> };
export async function DELETE(_request: Request, { params }: Context) { const ctx = await requirePermission("hr.qualifications.manage"); const { id, qId } = await params; try { return Response.json({ qualification: await removeQualification(ctx.tenantId, id, qId) }); } catch (error) { return phase3ApiError(error); } }

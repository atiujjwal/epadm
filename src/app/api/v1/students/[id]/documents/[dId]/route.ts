import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { verifyDocument } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";
const schema = z.object({ verificationStatus: z.enum(["verified","rejected"]), verificationNote: z.string().max(2000).optional() });
type Context = { params: Promise<{ id: string; dId: string }> };
export async function PATCH(request: Request, { params }: Context) { const ctx = await requirePermission("students.documents.verify"); const { id, dId } = await params; try { return Response.json({ document: await verifyDocument(ctx.tenantId, ctx.userId, id, dId, schema.parse(await request.json())) }); } catch (error) { return phase3ApiError(error); } }

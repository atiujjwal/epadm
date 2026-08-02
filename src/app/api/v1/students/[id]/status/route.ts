import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { changeStudentStatus } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";
const schema = z.object({ status: z.enum(["active","inactive","transferred","alumni"]), reason: z.string().trim().min(3).max(2000), effectiveDate: z.string().date() });
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) { const ctx = await requirePermission("students.archive"); const { id } = await params; try { return Response.json({ student: await changeStudentStatus(ctx.tenantId, ctx.userId, id, schema.parse(await request.json())) }); } catch (error) { return phase3ApiError(error); } }

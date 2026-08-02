import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { unlinkGuardian, updateGuardianLink } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";
const schema = z.object({ relationship: z.enum(["father","mother","grandfather","grandmother","uncle","aunt","sibling","legal_guardian","other"]).optional(), isPrimary: z.boolean().optional(), receivesSms: z.boolean().optional(), receivesEmail: z.boolean().optional(), receivesReports: z.boolean().optional(), canPickup: z.boolean().optional(), portalAccess: z.boolean().optional() });
type Context = { params: Promise<{ id: string; gId: string }> };
export async function PATCH(request: Request, { params }: Context) { const ctx = await requirePermission("students.guardians.write"); const { id, gId } = await params; try { return Response.json({ guardian: await updateGuardianLink(ctx.tenantId, id, gId, schema.parse(await request.json())) }); } catch (error) { return phase3ApiError(error); } }
export async function DELETE(_request: Request, { params }: Context) { const ctx = await requirePermission("students.guardians.write"); const { id, gId } = await params; try { return Response.json({ guardian: await unlinkGuardian(ctx.tenantId, id, gId) }); } catch (error) { return phase3ApiError(error); } }

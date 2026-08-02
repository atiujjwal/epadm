import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/db";
import { getMembership, updateMembership } from "@/lib/phase3/administration";
import { phase3ApiError } from "@/lib/phase3/api";

const updateSchema = z.object({ role: z.enum(USER_ROLES).optional(), customRoleId: z.string().uuid().nullable().optional(), status: z.enum(["active", "invited", "deactivated"]).optional() });
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const ctx = await requirePermission("administration.users.read");
  const { id } = await params;
  try { const membership = await getMembership(ctx.tenantId, id); return membership ? Response.json({ membership }) : Response.json({ error: "Membership not found" }, { status: 404 }); } catch (error) { return phase3ApiError(error); }
}

export async function PATCH(request: Request, { params }: Context) {
  const ctx = await requirePermission("administration.users.update"); const { id } = await params;
  try { return Response.json({ membership: await updateMembership(ctx.tenantId, ctx.userId, ctx.role, id, updateSchema.parse(await request.json())) }); } catch (error) { return phase3ApiError(error); }
}

export async function DELETE(_request: Request, { params }: Context) {
  const ctx = await requirePermission("administration.users.deactivate"); const { id } = await params;
  try { return Response.json({ membership: await updateMembership(ctx.tenantId, ctx.userId, ctx.role, id, { status: "deactivated" }) }); } catch (error) { return phase3ApiError(error); }
}

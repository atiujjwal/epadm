import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS, USER_ROLES } from "@/lib/db";
import { deactivateCustomRole, getCustomRole, updateCustomRole } from "@/lib/phase3/administration";
import { phase3ApiError } from "@/lib/phase3/api";
const grantSchema = z.object({ permission: z.enum(PERMISSIONS), scope: z.enum(["tenant", "campus", "department", "assigned", "self"]).nullable().optional(), effect: z.enum(["allow", "deny"]) });
const updateSchema = z.object({ name: z.string().trim().min(2).max(120).optional(), description: z.string().max(2000).nullable().optional(), baseRole: z.enum(USER_ROLES).optional(), isActive: z.boolean().optional(), grants: z.array(grantSchema).optional() });
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requirePermission("administration.roles.read"); const { id } = await params; const role = await getCustomRole(ctx.tenantId, id); return role ? Response.json({ role }) : Response.json({ error: "Role not found" }, { status: 404 }); }
export async function PATCH(request: Request, { params }: Context) { const ctx = await requirePermission("administration.roles.update"); const { id } = await params; try { return Response.json({ role: await updateCustomRole(ctx.tenantId, ctx.userId, ctx.role, id, updateSchema.parse(await request.json())) }); } catch (error) { return phase3ApiError(error); } }
export async function DELETE(_request: Request, { params }: Context) { const ctx = await requirePermission("administration.roles.update"); const { id } = await params; try { return Response.json({ role: await deactivateCustomRole(ctx.tenantId, id) }); } catch (error) { return phase3ApiError(error); } }

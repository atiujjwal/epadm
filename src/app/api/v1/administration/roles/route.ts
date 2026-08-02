import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS, USER_ROLES } from "@/lib/db";
import { createCustomRole, listRoles } from "@/lib/phase3/administration";
import { phase3ApiError } from "@/lib/phase3/api";
const grantSchema = z.object({ permission: z.enum(PERMISSIONS), scope: z.enum(["tenant", "campus", "department", "assigned", "self"]).nullable().optional(), effect: z.enum(["allow", "deny"]) });
const roleSchema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().max(2000).optional(), baseRole: z.enum(USER_ROLES), grants: z.array(grantSchema).optional() });
export async function GET() { const ctx = await requirePermission("administration.roles.read"); return Response.json(await listRoles(ctx.tenantId)); }
export async function POST(request: Request) { const ctx = await requirePermission("administration.roles.create"); try { return Response.json({ role: await createCustomRole(ctx.tenantId, ctx.userId, ctx.role, roleSchema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }

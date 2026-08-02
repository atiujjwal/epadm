import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { USER_ROLES, type UserRole } from "@/lib/db";
import { inviteMembership, listMemberships } from "@/lib/phase3/administration";
import { phase3ApiError } from "@/lib/phase3/api";

const inviteSchema = z.object({ email: z.string().email(), name: z.string().trim().min(2).max(255).optional(), role: z.enum(USER_ROLES) });

export async function GET(request: Request) {
  const ctx = await requirePermission("administration.users.read");
  const params = new URL(request.url).searchParams;
  try { return Response.json({ memberships: await listMemberships(ctx.tenantId, { q: params.get("q") || undefined, role: (params.get("role") || undefined) as UserRole | undefined, status: params.get("status") || undefined }) }); } catch (error) { return phase3ApiError(error); }
}

export async function POST(request: Request) {
  const ctx = await requirePermission("administration.users.create");
  try { return Response.json({ membership: await inviteMembership(ctx.tenantId, ctx.userId, ctx.role, inviteSchema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase3ApiError(error); }
}

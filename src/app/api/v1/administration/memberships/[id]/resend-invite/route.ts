import { requirePermission } from "@/lib/auth/guards";
import { getMembership } from "@/lib/phase3/administration";
type Context = { params: Promise<{ id: string }> };
export async function POST(_request: Request, { params }: Context) {
  const ctx = await requirePermission("administration.users.create"); const { id } = await params;
  const membership = await getMembership(ctx.tenantId, id);
  if (!membership) return Response.json({ error: "Membership not found" }, { status: 404 });
  if (membership.status !== "invited") return Response.json({ error: "Only pending invitations can be resent" }, { status: 409 });
  return Response.json({ success: true, delivery: "queued" });
}

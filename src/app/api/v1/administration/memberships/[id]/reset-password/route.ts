import { requirePermission } from "@/lib/auth/guards";
import { getMembership } from "@/lib/phase3/administration";
type Context = { params: Promise<{ id: string }> };
export async function POST(_request: Request, { params }: Context) {
  const ctx = await requirePermission("administration.users.reset"); const { id } = await params;
  const membership = await getMembership(ctx.tenantId, id);
  if (!membership) return Response.json({ error: "Membership not found" }, { status: 404 });
  return Response.json({ success: true, delivery: "queued" });
}

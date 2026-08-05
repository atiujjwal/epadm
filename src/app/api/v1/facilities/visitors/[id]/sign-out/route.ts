import { requirePermission } from "@/lib/auth/guards";
import { signOutVisitor } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function PATCH(_request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("facilities.visitors.manage");
    const { id } = await params;
    const visitor = await signOutVisitor(ctx.tenantId, ctx.userId, id);
    return Response.json({ visitor });
  } catch (error) {
    return phase10ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel, signInVisitor } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("facilities.visitors.manage");
  const model = await listFacilitiesModel(ctx.tenantId);
  return Response.json({ visitors: model.visitors });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("facilities.visitors.manage");
    const visitor = await signInVisitor(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ visitor }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { createFacilitySpace, listFacilitiesModel } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("facilities.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  return Response.json({ spaces: model.spaces });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("facilities.spaces.manage");
    const space = await createFacilitySpace(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ space }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

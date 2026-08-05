import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel, recordHealthVisit } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("facilities.health.manage");
  const model = await listFacilitiesModel(ctx.tenantId, true);
  return Response.json({ healthRecords: model.healthRecords });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("facilities.health.manage");
    const record = await recordHealthVisit(ctx.tenantId, ctx.userId, ["facilities.health.manage"], await request.json());
    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

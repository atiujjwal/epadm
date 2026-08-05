import { requirePermission } from "@/lib/auth/guards";
import { createHostelBuilding, listHostelModel } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("hostel.read");
  const model = await listHostelModel(ctx.tenantId);
  return Response.json({ buildings: model.buildings });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("hostel.rooms.manage");
    const building = await createHostelBuilding(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ building }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

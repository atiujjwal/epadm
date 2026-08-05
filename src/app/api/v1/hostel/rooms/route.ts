import { requirePermission } from "@/lib/auth/guards";
import { createHostelRoom, listHostelModel } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("hostel.read");
  const model = await listHostelModel(ctx.tenantId);
  return Response.json({ rooms: model.rooms });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("hostel.rooms.manage");
    const room = await createHostelRoom(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ room }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { addActivityMember, listActivitiesModel } from "@/lib/phase10/activities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  return Response.json({ members: model.members });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("activities.members.manage");
    const member = await addActivityMember(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ member }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

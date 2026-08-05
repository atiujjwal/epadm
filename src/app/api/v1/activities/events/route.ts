import { requirePermission } from "@/lib/auth/guards";
import { createActivityEvent, listActivitiesModel } from "@/lib/phase10/activities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  return Response.json({ events: model.events });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("activities.manage");
    const event = await createActivityEvent(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

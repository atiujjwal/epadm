import { requirePermission } from "@/lib/auth/guards";
import { listActivitiesModel, recordStudentAchievement } from "@/lib/phase10/activities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("activities.read");
  const model = await listActivitiesModel(ctx.tenantId);
  return Response.json({ achievements: model.achievements });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("activities.achievements.manage");
    const achievement = await recordStudentAchievement(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ achievement }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

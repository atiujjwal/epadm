import { getCtx } from "@/lib/context";
import { updateNotificationPreference } from "@/lib/phase11/notifications";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function POST(request: Request) {
  try {
    const ctx = await getCtx();
    const preference = await updateNotificationPreference(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ preference });
  } catch (error) {
    return phase11ApiError(error);
  }
}

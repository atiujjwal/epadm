import { requirePermission } from "@/lib/auth/guards";
import { sendQueuedNotification } from "@/lib/phase11/notifications";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function POST(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("communications.queue.manage");
    const { id } = await params;
    const body = await request.json();
    const notification = await sendQueuedNotification(ctx.tenantId, id, Boolean(body.ok), body.errorMessage);
    return Response.json({ notification });
  } catch (error) {
    return phase11ApiError(error);
  }
}

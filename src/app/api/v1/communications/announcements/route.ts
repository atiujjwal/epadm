import { requirePermission } from "@/lib/auth/guards";
import { createAnnouncement, listCommunicationsModel } from "@/lib/phase11/notifications";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function GET() {
  const ctx = await requirePermission("communications.read");
  const model = await listCommunicationsModel(ctx.tenantId);
  return Response.json({ announcements: model.announcements });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("communications.announcements.manage");
    const result = await createAnnouncement(ctx.tenantId, ctx.userId, await request.json());
    return Response.json(result, { status: 201 });
  } catch (error) {
    return phase11ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { createParentMessage, listCommunicationsModel } from "@/lib/phase11/notifications";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function GET() {
  const ctx = await requirePermission("communications.messages.manage");
  const model = await listCommunicationsModel(ctx.tenantId);
  return Response.json({ messages: model.messages });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("communications.messages.manage");
    const message = await createParentMessage(ctx.tenantId, ctx.userId, { ...(await request.json()), direction: "school_to_parent" });
    return Response.json({ message }, { status: 201 });
  } catch (error) {
    return phase11ApiError(error);
  }
}

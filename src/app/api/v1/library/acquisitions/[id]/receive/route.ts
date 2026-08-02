import { requirePermission } from "@/lib/auth/guards";
import { receiveAcquisition } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("library.acquisitions.manage");
  const { id } = await params;
  try {
    return Response.json(await receiveAcquisition(ctx.tenantId, ctx.userId, id));
  } catch (error) {
    return phase9ApiError(error);
  }
}

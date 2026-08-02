import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { cancelLabBooking } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ reason: z.string().nullable().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("laboratories.bookings.manage");
  const { id } = await params;
  try {
    const booking = await cancelLabBooking(ctx.tenantId, ctx.userId, id, schema.parse(await request.json()).reason);
    return Response.json({ booking });
  } catch (error) {
    return phase9ApiError(error);
  }
}

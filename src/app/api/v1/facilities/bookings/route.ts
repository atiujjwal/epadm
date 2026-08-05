import { requirePermission } from "@/lib/auth/guards";
import { createFacilityBooking, listFacilitiesModel } from "@/lib/phase10/facilities";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("facilities.read");
  const model = await listFacilitiesModel(ctx.tenantId);
  return Response.json({ bookings: model.bookings });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("facilities.bookings.manage");
    const booking = await createFacilityBooking(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}

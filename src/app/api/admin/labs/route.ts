import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  createLabBooking,
  LAB_READ_PERMISSION,
  LAB_WRITE_PERMISSION,
  listLabBookings,
} from "@/lib/admin/labs";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const labBookingSchema = z.object({
  labName: z.string().trim().min(2).max(120),
  session: z.string().trim().min(1).max(80),
  classLabel: z.string().trim().max(80).optional().or(z.literal("")),
  inCharge: z.string().trim().max(255).optional().or(z.literal("")),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().min(8)),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function GET(req: Request) {
  try {
    const ctx = await requirePermission(LAB_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const bookings = await listLabBookings(ctx.tenantId, search);
    return ok({ bookings });
  } catch (error) {
    console.error("[admin/labs][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(LAB_WRITE_PERMISSION);
    const input = labBookingSchema.parse(await req.json());

    const booking = await createLabBooking({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[admin/labs][POST] Unexpected error:", error);
    return serverError();
  }
}

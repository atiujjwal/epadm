import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createLabBooking, listLaboratoryModel } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ laboratoryId: z.string().uuid(), session: z.string().min(1), bookingDate: z.string().min(1), periodId: z.string().uuid(), sectionId: z.string().uuid().nullable().optional(), teacherStaffId: z.string().uuid().nullable().optional(), topic: z.string().nullable().optional(), classLabel: z.string().nullable().optional(), notes: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  return Response.json({ bookings: model.bookings });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("laboratories.bookings.manage");
  try {
    const booking = await createLabBooking(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

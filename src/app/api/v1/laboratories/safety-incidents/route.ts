import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { recordLabSafetyIncident } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ laboratoryId: z.string().uuid(), bookingId: z.string().uuid().nullable().optional(), incidentDate: z.string().min(1), severity: z.string().optional(), title: z.string().min(1), description: z.string().nullable().optional(), actionTaken: z.string().nullable().optional(), status: z.string().optional() });

export async function POST(request: Request) {
  const ctx = await requirePermission("laboratories.safety.manage");
  try {
    const incident = await recordLabSafetyIncident(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ incident }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

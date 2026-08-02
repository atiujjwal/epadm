import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createLaboratory, listLaboratoryModel } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ code: z.string().min(1), name: z.string().min(1), labType: z.string().optional(), roomId: z.string().uuid().nullable().optional(), capacity: z.coerce.number().int().min(0).optional(), inChargeStaffId: z.string().uuid().nullable().optional(), safetyInstructions: z.string().nullable().optional(), status: z.string().optional() });

export async function GET() {
  const ctx = await requirePermission("laboratories.read");
  return Response.json(await listLaboratoryModel(ctx.tenantId));
}

export async function POST(request: Request) {
  const ctx = await requirePermission("laboratories.manage");
  try {
    const lab = await createLaboratory(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ lab }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

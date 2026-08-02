import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel, saveLabEquipment } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ laboratoryId: z.string().uuid(), assetCode: z.string().min(1), name: z.string().min(1), category: z.string().nullable().optional(), quantity: z.coerce.number().int().positive().optional(), workingQuantity: z.coerce.number().int().min(0).optional(), condition: z.string().optional(), status: z.string().optional(), notes: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  return Response.json({ equipment: model.equipment });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("laboratories.inventory.manage");
  try {
    const equipment = await saveLabEquipment(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ equipment }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

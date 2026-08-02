import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listLaboratoryModel, saveLabConsumable } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ laboratoryId: z.string().uuid(), itemCode: z.string().min(1), name: z.string().min(1), unit: z.string().optional(), quantityOnHand: z.union([z.string(), z.number()]).optional(), reorderLevel: z.union([z.string(), z.number()]).optional(), unitCostPaise: z.coerce.number().int().min(0).optional(), hazardClass: z.string().nullable().optional(), expiryDate: z.string().nullable().optional(), status: z.string().optional() });

export async function GET() {
  const ctx = await requirePermission("laboratories.read");
  const model = await listLaboratoryModel(ctx.tenantId);
  return Response.json({ consumables: model.consumables });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("laboratories.inventory.manage");
  try {
    const consumable = await saveLabConsumable(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ consumable }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

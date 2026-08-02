import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { adjustLabConsumableStock } from "@/lib/phase9/laboratories";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ delta: z.union([z.string(), z.number()]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("laboratories.inventory.manage");
  const { id } = await params;
  try {
    const consumable = await adjustLabConsumableStock(ctx.tenantId, ctx.userId, id, schema.parse(await request.json()).delta);
    return Response.json({ consumable });
  } catch (error) {
    return phase9ApiError(error);
  }
}

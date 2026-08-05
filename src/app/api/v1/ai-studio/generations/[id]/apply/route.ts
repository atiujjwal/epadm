import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { applyAIGeneration } from "@/lib/phase12/ai-studio";

const schema = z.object({
  appliedToType: z.string().max(80).nullable().optional(),
  appliedToId: z.string().uuid().nullable().optional(),
  editedOutput: z.string().nullable().optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requirePermission("ai-studio.use");
    const { id } = await context.params;
    return Response.json({ generation: await applyAIGeneration(ctx.tenantId, ctx.userId, id, schema.parse(await request.json())) });
  } catch (error) {
    return phase12ApiError(error);
  }
}

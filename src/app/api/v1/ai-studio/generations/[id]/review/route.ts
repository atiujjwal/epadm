import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { reviewAIGeneration } from "@/lib/phase12/ai-studio";

const schema = z.object({ status: z.enum(["reviewed", "rejected", "archived"]) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requirePermission("ai-studio.governance");
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    return Response.json({ generation: await reviewAIGeneration(ctx.tenantId, ctx.userId, id, input.status) });
  } catch (error) {
    return phase12ApiError(error);
  }
}

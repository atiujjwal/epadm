import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { AI_FEATURES, generateAIContent, type AIFeatureKey } from "@/lib/phase12/ai-studio";
import { phase12ApiError } from "@/lib/phase12/analytics";

const schema = z.object({
  feature: z.enum(AI_FEATURES.map((feature) => feature.key) as [string, ...string[]]),
  prompt: z.string().max(5000).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("ai-studio.use");
    const input = schema.parse(await request.json());
    return Response.json({ generation: await generateAIContent(ctx.tenantId, ctx.userId, { ...input, feature: input.feature as AIFeatureKey }) }, { status: 201 });
  } catch (error) {
    return phase12ApiError(error);
  }
}

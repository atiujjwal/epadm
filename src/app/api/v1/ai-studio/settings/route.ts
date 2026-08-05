import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { AI_FEATURES, ensureAISettings, updateAISettings } from "@/lib/phase12/ai-studio";

const schema = z.object({
  featuresEnabled: z.array(z.enum(AI_FEATURES.map((feature) => feature.key) as [string, ...string[]])).optional(),
  monthlyTokenLimit: z.number().int().min(0).optional(),
  resetUsage: z.boolean().optional(),
});

export async function GET() {
  try {
    const ctx = await requirePermission("ai-studio.settings");
    return Response.json({ settings: await ensureAISettings(ctx.tenantId), features: AI_FEATURES });
  } catch (error) {
    return phase12ApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("ai-studio.settings");
    return Response.json({ settings: await updateAISettings(ctx.tenantId, schema.parse(await request.json())), features: AI_FEATURES });
  } catch (error) {
    return phase12ApiError(error);
  }
}

import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { listAIGenerations } from "@/lib/phase12/ai-studio";

export async function GET(request: Request) {
  try {
    const ctx = await requirePermission("ai-studio.read");
    const feature = new URL(request.url).searchParams.get("feature");
    return Response.json({ generations: await listAIGenerations(ctx.tenantId, feature) });
  } catch (error) {
    return phase12ApiError(error);
  }
}

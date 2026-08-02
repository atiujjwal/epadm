import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase4ApiError, previewRollover } from "@/lib/phase4/academics";

const schema = z.object({ fromYearId: z.string().uuid(), toYearId: z.string().uuid() });

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.progression.read");
  try {
    const input = schema.parse(await request.json());
    return Response.json({ preview: await previewRollover(ctx.tenantId, input.fromYearId, input.toYearId) });
  } catch (error) { return phase4ApiError(error); }
}

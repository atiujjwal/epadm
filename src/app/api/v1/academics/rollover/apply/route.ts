import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { applyRollover, phase4ApiError } from "@/lib/phase4/academics";

const schema = z.object({ fromYearId: z.string().uuid(), toYearId: z.string().uuid() });

export async function POST(request: Request) {
  const ctx = await requirePermission("academics.write");
  try {
    const input = schema.parse(await request.json());
    return Response.json(await applyRollover(ctx.tenantId, ctx.userId, input.fromYearId, input.toYearId));
  } catch (error) { return phase4ApiError(error); }
}

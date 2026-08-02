import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { returnLibraryCopy } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ issueId: z.string().uuid(), returnedAt: z.string().nullable().optional() });

export async function POST(request: Request) {
  const ctx = await requirePermission("library.circulation.manage");
  try {
    const input = schema.parse(await request.json());
    const result = await returnLibraryCopy(ctx.tenantId, ctx.userId, input.issueId, input.returnedAt ? new Date(input.returnedAt) : new Date());
    return Response.json(result);
  } catch (error) {
    return phase9ApiError(error);
  }
}

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { renewLibraryIssue } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ issueId: z.string().uuid() });

export async function POST(request: Request) {
  const ctx = await requirePermission("library.circulation.manage");
  try {
    const issue = await renewLibraryIssue(ctx.tenantId, ctx.userId, schema.parse(await request.json()).issueId);
    return Response.json({ issue });
  } catch (error) {
    return phase9ApiError(error);
  }
}

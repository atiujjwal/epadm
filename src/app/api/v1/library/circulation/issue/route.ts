import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { issueLibraryCopy } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ copyId: z.string().uuid(), memberId: z.string().uuid(), dueDate: z.string().nullable().optional() });

export async function POST(request: Request) {
  const ctx = await requirePermission("library.circulation.manage");
  try {
    const issue = await issueLibraryCopy(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ issue }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}

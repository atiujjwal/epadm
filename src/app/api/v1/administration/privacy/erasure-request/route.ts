import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { submitErasureRequest } from "@/lib/governance/retention";

const schema = z.object({
  studentId: z.string().uuid(),
  reason: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
  const ctx = await requirePermission("administration.privacy.manage");
  const input = schema.parse(await request.json());
  return Response.json({ request: await submitErasureRequest(ctx.tenantId, ctx.userId, input) }, { status: 201 });
}

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { requirePlatformOperator } from "@/lib/platform/context";
import { createSupportImpersonationSession } from "@/lib/platform/impersonation";

const schema = z.object({
  tenantId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  reason: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
  const ctx = await requirePlatformOperator();
  const input = schema.parse(await request.json());
  const h = await headers();
  const result = await createSupportImpersonationSession({
    operatorId: ctx.operatorId,
    tenantId: input.tenantId,
    targetUserId: input.targetUserId,
    reason: input.reason,
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
    userAgent: h.get("user-agent"),
  });
  const cookieStore = await cookies();
  cookieStore.set("support_impersonation_session", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });
  return Response.json({
    token: result.token,
    sessionId: result.session.id,
    tenantId: result.session.tenantId,
    targetUserId: result.session.targetUserId,
    expiresAt: result.session.expiresAt,
  }, { status: 201 });
}

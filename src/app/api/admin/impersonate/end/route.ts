import { cookies, headers } from "next/headers";
import { requirePlatformOperator } from "@/lib/platform/context";
import { endSupportImpersonationSession } from "@/lib/platform/impersonation";

export async function POST() {
  const ctx = await requirePlatformOperator();
  const cookieStore = await cookies();
  const token = cookieStore.get("support_impersonation_session")?.value;
  if (token) {
    const h = await headers();
    await endSupportImpersonationSession({
      token,
      operatorId: ctx.operatorId,
      ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
      userAgent: h.get("user-agent"),
    });
  }
  cookieStore.set("support_impersonation_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return Response.json({ success: true });
}

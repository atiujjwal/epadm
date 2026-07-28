import { withApiObservability } from "@/lib/observability/api-handler";
import { cookies } from "next/headers";
import { PLATFORM_COOKIE } from "@/lib/platform/auth/token";
import { revokePlatformSession } from "@/lib/platform/auth/session";
import { verifyPlatformToken } from "@/lib/platform/auth/token";
import { ok } from "@/lib/http/responses";

async function POSTHandler() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLATFORM_COOKIE)?.value;

  if (token) {
    const payload = await verifyPlatformToken(token);
    if (payload) {
      await revokePlatformSession(payload.sessionId);
    }
  }

  cookieStore.set(PLATFORM_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return ok({ success: true });
}

export const POST = withApiObservability(POSTHandler);

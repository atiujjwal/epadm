import { cookies } from "next/headers";
import { z } from "zod";
import { verifyPlatformMfa } from "@/lib/platform/auth/login";
import {
  PLATFORM_COOKIE,
  PLATFORM_TOKEN_TTL,
} from "@/lib/platform/auth/token";
import { badRequest, ok, unauthorized } from "@/lib/http/responses";

const mfaSchema = z.object({
  mfaToken: z.string().min(10),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  try {
    const body = mfaSchema.parse(await req.json());
    const result = await verifyPlatformMfa(body.mfaToken, body.code);

    if (!result.ok) {
      return unauthorized("Invalid MFA code");
    }

    const res = ok({ success: true, operator: result.operator });
    const cookieStore = await cookies();
    cookieStore.set(PLATFORM_COOKIE, result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PLATFORM_TOKEN_TTL,
    });

    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[platform/auth/mfa]", error);
    return unauthorized("MFA verification failed");
  }
}

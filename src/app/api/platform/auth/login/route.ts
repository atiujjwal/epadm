import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  authenticatePlatformOperator,
} from "@/lib/platform/auth/login";
import {
  PLATFORM_COOKIE,
  PLATFORM_TOKEN_TTL,
} from "@/lib/platform/auth/token";
import { badRequest, ok, unauthorized } from "@/lib/http/responses";

const isDev = process.env.NODE_ENV !== "production";

const loginSchema = z.object({
  email: isDev
    ? z.string().trim().min(1)
    : z.string().trim().email(),
  password: isDev
    ? z.string().min(1)
    : z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = loginSchema.parse(json);
    const result = await authenticatePlatformOperator(
      body.email,
      body.password,
    );

    if (!result.ok) {
      return unauthorized("Invalid email or password");
    }

    const mfaCheck = result as any;
    if (mfaCheck.requiresMfa) {
      return ok({
        success: true,
        requiresMfa: true,
        mfaToken: mfaCheck.mfaToken,
      });
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

    console.error("[platform/auth/login]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

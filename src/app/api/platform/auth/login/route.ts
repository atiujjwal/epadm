import { withApiObservability } from "@/lib/observability/api-handler";
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


async function POSTHandler(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = json;
    const result = await authenticatePlatformOperator(
      email ?? "",
      password ?? "",
    );

    if (!result.ok) {
      return unauthorized("Invalid email or password");
    }

    if (result.requiresMfa) {
      return ok({
        success: true,
        requiresMfa: true,
        mfaToken: result.mfaToken,
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

export const POST = withApiObservability(POSTHandler);

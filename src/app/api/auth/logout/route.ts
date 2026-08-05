import { withApiObservability } from "@/lib/observability/api-handler";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function POSTHandler() {
  const cookieStore = await cookies();
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };
  cookieStore.set("auth_token", "", clearOptions);
  cookieStore.set("platform_auth_token", "", clearOptions);
  cookieStore.set("platform_session", "", clearOptions);
  
  return NextResponse.json({ success: true });
}

export const POST = withApiObservability(POSTHandler);

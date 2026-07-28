import { withApiObservability } from "@/lib/observability/api-handler";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function POSTHandler() {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("platform_auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("platform_session", "", { maxAge: 0, path: "/" });
  
  return NextResponse.json({ success: true });
}

export const POST = withApiObservability(POSTHandler);

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("platform_auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("platform_session", "", { maxAge: 0, path: "/" });
  
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("platform_auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("platform_session", "", { maxAge: 0, path: "/" });
  
  const url = new URL(req.url);
  const loginUrl = new URL("/login", url.origin);
  return NextResponse.redirect(loginUrl);
}

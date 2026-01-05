import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";

  // Source [617]: Hostname Parsing (e.g., stxavier.schoolapp.com)
  // Logic to extract subdomain and resolve to Tenant UUID would go here.
  // Ideally cached in Redis [Source 618].

  // Placeholder logic for Phase 1 setup
  const subdomain = hostname.split(".")[0];

  // Source [620]: Inject Tenant ID into header for downstream consumption
  const requestHeaders = new Headers(req.headers);
  // requestHeaders.set('x-tenant-id', resolvedTenantUuid);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

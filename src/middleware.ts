import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Exclude static assets and internal Next.js paths
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api/auth") || // Allow global auth routes
    req.nextUrl.pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  const hostname = req.headers.get("host") || "";
  const tenantId = await resolveTenantId(hostname);

  if (!tenantId) {
    // If tenant not found, rewrite to a global 404 or landing page
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // Inject resolved UUID into request header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-id", tenantId);

  // Rewrite URL to include tenant ID internally
  const url = req.nextUrl.clone();
  url.pathname = `/_root/${tenantId}${url.pathname}`;

  return NextResponse.rewrite(url, {
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

// In a real app, import this from a lib folder
// Simulating the high-performance cache lookup
async function resolveTenantId(host: string): Promise<string | null> {
  const subdomain = host.split(".")[0];

  // 1. Check Cache (Redis)
  // const cached = await redis.get(`tenant:${subdomain}`);
  // if (cached) return cached;

  // 2. Fallback to DB (Simulated for Phase 4 setup)
  // In production, this calls a dedicated internal API or direct DB query
  // if edge-compatible drivers are available.
  // For now, we mock the resolution to allow development to proceed.
  if (subdomain === "demo") return "11111111-1111-1111-1111-111111111111"; // Mock UUID

  return null;
}

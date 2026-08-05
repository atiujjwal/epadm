import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  onboardingStatus: vi.fn(),
  verifyPlatformToken: vi.fn(),
  verifySessionToken: vi.fn(),
}));

vi.mock("@/lib/auth/token", () => ({
  verifySessionToken: mocks.verifySessionToken,
}));
vi.mock("@/lib/platform/auth/token", () => ({
  PLATFORM_COOKIE: "platform_auth_token",
  verifyPlatformToken: mocks.verifyPlatformToken,
}));
vi.mock("@/lib/onboarding/gate", () => ({
  canManageOnboarding: (role: string) => role === "admin" || role === "superadmin",
  getOnboardingStatusForGate: mocks.onboardingStatus,
}));
vi.mock("@/lib/security/csrf", () => ({
  attachCsrfCookie: (_request: NextRequest, response: Response) => response,
  validateCsrf: () => null,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  checkAuthRateLimit: () => null,
  checkRateLimit: () => null,
  rateLimitForPath: () => ({ windowMs: 60_000, maxRequests: 100 }),
}));

import { proxy } from "@/proxy";

const tenantId = "11111111-1111-4111-8111-111111111111";

function request(
  pathname: string,
  options: { authenticated?: boolean; host?: string; opsAuthenticated?: boolean } = {},
) {
  const host = options.host ?? "school.localhost";
  const cookies = [
    options.authenticated ? "auth_token=session" : "",
    options.opsAuthenticated ? "platform_auth_token=operator" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return new NextRequest(`http://${host}${pathname}`, {
    headers: {
      host,
      ...(cookies ? { cookie: cookies } : {}),
    },
  });
}

describe("src/proxy.ts routing behavior", () => {
  beforeEach(() => {
    mocks.onboardingStatus.mockResolvedValue("COMPLETED");
    mocks.verifySessionToken.mockResolvedValue({
      tenantId,
      userId: "22222222-2222-4222-8222-222222222222",
      role: "admin",
      planTier: "pro",
    });
    mocks.verifyPlatformToken.mockResolvedValue({
      operatorId: "33333333-3333-4333-8333-333333333333",
      email: "operator@example.com",
      sessionId: "session-id",
    });
  });

  it("rewrites a school route to the hidden tenant route", async () => {
    const response = await proxy(request("/students", { authenticated: true }));
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `http://school.localhost/root/${tenantId}/students`,
    );
    expect(response.headers.get("x-request-id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/,
    );
  });

  it("preserves a caller-provided request correlation id", async () => {
    const correlated = new NextRequest("http://school.localhost/api/ready", {
      headers: { host: "school.localhost", "x-request-id": "request-123" },
    });
    const response = await proxy(correlated);
    expect(response.headers.get("x-request-id")).toBe("request-123");
  });

  it("redirects legacy tenant module aliases to canonical paths", async () => {
    const users = await proxy(request("/users", { authenticated: true }));
    const fees = await proxy(request("/fees", { authenticated: true }));
    const finance = await proxy(request("/finance", { authenticated: true }));
    const vehicles = await proxy(request("/vehicles", { authenticated: true }));
    const labs = await proxy(request("/labs", { authenticated: true }));
    const teacher = await proxy(request("/teacher/home", { authenticated: true }));
    const student = await proxy(request("/student/home", { authenticated: true }));
    const adminDashboard = await proxy(request("/admin-dashboard", { authenticated: true }));
    expect(users.status).toBe(301);
    expect(fees.status).toBe(301);
    expect(finance.status).toBe(200);
    expect(vehicles.status).toBe(301);
    expect(labs.status).toBe(301);
    expect(teacher.status).toBe(301);
    expect(student.status).toBe(301);
    expect(adminDashboard.status).toBe(301);
    expect(users.headers.get("location")).toBe(
      "http://school.localhost/administration/users",
    );
    expect(fees.headers.get("location")).toBe(
      "http://school.localhost/finance/fees",
    );
    expect(vehicles.headers.get("location")).toBe(
      "http://school.localhost/transport",
    );
    expect(labs.headers.get("location")).toBe(
      "http://school.localhost/laboratories",
    );
    expect(teacher.headers.get("location")).toBe(
      "http://school.localhost/teacher",
    );
    expect(student.headers.get("location")).toBe(
      "http://school.localhost/student",
    );
    expect(adminDashboard.headers.get("location")).toBe(
      "http://school.localhost/dashboard",
    );
  });

  it("keeps exact /admin in tenant RBAC and redirects /admin children to ops", async () => {
    const tenantAdmin = await proxy(request("/admin", { authenticated: true }));
    expect(tenantAdmin.headers.get("location")).toBe(
      "http://school.localhost/administration/users",
    );
    expect(tenantAdmin.status).toBe(301);

    const platformAdmin = await proxy(
      request("/admin/tenants", { authenticated: true }),
    );
    expect(platformAdmin.headers.get("location")).toBe(
      "http://ops.localhost/admin/tenants",
    );
  });

  it("serves the authenticated ops console directly", async () => {
    const response = await proxy(
      request("/admin", { host: "ops.localhost", opsAuthenticated: true }),
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("rewrites the authenticated ops /cms alias to /admin", async () => {
    const response = await proxy(
      request("/cms", { host: "ops.localhost", opsAuthenticated: true }),
    );
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://ops.localhost/admin",
    );
  });

  it("redirects an unauthenticated school request to login", async () => {
    const response = await proxy(request("/students"));
    expect(response.headers.get("location")).toBe("http://school.localhost/#login");
  });

  it("gates incomplete setup by role", async () => {
    mocks.onboardingStatus.mockResolvedValue("IN_PROGRESS");
    mocks.verifySessionToken.mockResolvedValue({
      tenantId,
      userId: "22222222-2222-4222-8222-222222222222",
      role: "teacher",
      planTier: "pro",
    });

    const response = await proxy(request("/teacher", { authenticated: true }));
    expect(response.headers.get("location")).toBe(
      "http://school.localhost/setup-pending",
    );
  });

  it("rewrites completed users to the tenant root for role landing", async () => {
    const response = await proxy(request("/", { authenticated: true }));
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `http://school.localhost/root/${tenantId}`,
    );
  });
});

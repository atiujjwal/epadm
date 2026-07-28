import { describe, expect, it, vi } from "vitest";

const loggerMocks = vi.hoisted(() => ({ info: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/observability/logger", () => ({
  logger: { info: loggerMocks.info },
}));

import { withApiObservability } from "@/lib/observability/api-handler";

describe("API observability wrapper", () => {
  it("logs the handler's actual status and correlation context", async () => {
    const handler = withApiObservability(async (request: Request) => {
      void request;
      return Response.json({ status: "error" }, { status: 503 });
    });
    const request = new Request("https://school.example/api/health", {
      headers: {
        "x-request-id": "req-health",
        "x-tenant-id": "tenant-1",
      },
    });

    const response = await handler(request);

    expect(response.status).toBe(503);
    expect(response.headers.get("x-request-id")).toBe("req-health");
    expect(loggerMocks.info).toHaveBeenCalledWith(
      "API request completed",
      expect.objectContaining({
        requestId: "req-health",
        tenantId: "tenant-1",
        path: "/api/health",
        status: 503,
      }),
    );
  });
});

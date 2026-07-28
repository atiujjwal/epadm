import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createHealthResponse } from "@/app/api/health/route";

describe("health endpoint", () => {
  it("reports a connected database", async () => {
    const response = await createHealthResponse(vi.fn(async () => undefined));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok", db: "connected" });
  });

  it("reports database failures with 503", async () => {
    const response = await createHealthResponse(
      vi.fn(async () => { throw new Error("offline"); }),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "error", db: "disconnected" });
  });
});

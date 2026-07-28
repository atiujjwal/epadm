import { describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ role: "admin" }));

vi.mock("@/lib/context", () => ({
  getCtx: vi.fn(async () => ({ role: authState.role })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  forbidden: vi.fn(() => {
    throw new Error("FORBIDDEN");
  }),
}));

import TenantRootPage from "@/app/root/[tenant]/page";
import AdminDashboardLegacy from "@/app/root/[tenant]/admin-dashboard/page";
import TeacherHomeLegacy from "@/app/root/[tenant]/(teacher)/teacher/home/page";
import StudentHomeLegacy from "@/app/root/[tenant]/(student)/student/home/page";
import { requirePermission } from "@/lib/auth/guards";

describe("role entry routes", () => {
  it.each([
    ["admin", "/dashboard"],
    ["teacher", "/teacher"],
    ["student", "/student"],
    ["parent", "/parent"],
    ["accountant", "/finance/fees"],
    ["librarian", "/library"],
    ["staff", "/me/profile"],
    ["superadmin", "/dashboard"],
  ])("sends %s to %s", async (role, path) => {
    authState.role = role;
    await expect(TenantRootPage()).rejects.toThrow(`REDIRECT:${path}`);
  });

  it.each([
    [TeacherHomeLegacy, "/teacher"],
    [StudentHomeLegacy, "/student"],
    [AdminDashboardLegacy, "/dashboard"],
  ])("keeps legacy entry routes as redirects", (legacyPage, path) => {
    expect(() => legacyPage()).toThrow(`REDIRECT:${path}`);
  });

  it("rejects a teacher requesting finance on the server", async () => {
    authState.role = "teacher";
    await expect(requirePermission("finance.fees.read")).rejects.toThrow(
      "FORBIDDEN",
    );
  });

  it("rejects a librarian requesting HR on the server", async () => {
    authState.role = "librarian";
    await expect(requirePermission("hr.read")).rejects.toThrow("FORBIDDEN");
  });
});

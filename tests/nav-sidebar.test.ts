import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationState = vi.hoisted(() => ({ pathname: "/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

import { NavSidebar } from "@/components/shell/nav-sidebar";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { getAuthorizedNavigation, toClientRoute } from "@/lib/navigation/route-registry";

const allEntitlements = ["module.students"];

function renderFor(role: keyof typeof DEFAULT_ROLE_PERMISSIONS, pathname: string) {
  navigationState.pathname = pathname;
  return renderToStaticMarkup(
    React.createElement(NavSidebar, {
      authorizedRoutes: getAuthorizedNavigation(
        DEFAULT_ROLE_PERMISSIONS[role],
        allEntitlements,
      ).map(toClientRoute),
      tenantId: "tenant-1",
      isAdmin: role === "admin",
    }),
  );
}

describe("registry-driven navigation", () => {
  beforeEach(() => {
    navigationState.pathname = "/dashboard";
  });

  it("renders authorized admin groups and locks planned modules", () => {
    const html = renderFor("admin", "/dashboard");
    expect(html).toContain("Workspace");
    expect(html).toContain("Student Lifecycle");
    expect(html).toContain("Fees &amp; Billing");
    expect(html).toContain("Coming soon");
  });

  it("shows the required teacher modules and omits Finance and HR", () => {
    const html = renderFor("teacher", "/teacher");
    expect(html).toContain("Home");
    expect(html).toContain("Teaching &amp; Learning");
    expect(html).toContain("Attendance");
    expect(html).toContain("Communications");
    expect(html).not.toContain("Fees &amp; Billing");
    expect(html).not.toContain("Human Resources");
    expect(html).not.toContain("Coming soon");
  });

  it.each([
    ["/students", "/students"],
    ["/hr/staff", "/hr"],
    ["/finance/fees", "/finance/fees"],
  ])("marks %s and its module active", (pathname, href) => {
    const html = renderFor("admin", pathname);
    expect(html).toMatch(
      new RegExp(`<a[^>]*aria-current="page"[^>]*href="${href.replaceAll("/", "\\/")}"`),
    );
  });

  it("renders children only for the active module", () => {
    const active = renderFor("admin", "/hr/staff");
    const inactive = renderFor("admin", "/dashboard");
    expect(active).toContain("Staff Directory");
    expect(active).toContain("Departments");
    expect(inactive).not.toContain("Staff Directory");
  });
});

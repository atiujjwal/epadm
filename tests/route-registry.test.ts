import { describe, expect, it } from "vitest";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { USER_ROLES, type UserRole } from "@/lib/db";
import {
  findRouteForPath,
  getAuthorizedNavigation,
  getBreadcrumbsForPath,
  getModuleRoutes,
} from "@/lib/navigation/route-registry";

const coreEntitlements = ["module.students"];

describe("route registry", () => {
  it.each(USER_ROLES)("filters navigation using the %s permission set", (role) => {
    const permissions = DEFAULT_ROLE_PERMISSIONS[role];
    const routes = getAuthorizedNavigation(permissions, coreEntitlements);

    for (const route of routes) {
      if (route.requiredPermission) {
        expect(permissions).toContain(route.requiredPermission);
      }
      for (const routeChild of route.children ?? []) {
        if (routeChild.requiredPermission) {
          expect(permissions).toContain(routeChild.requiredPermission);
        }
      }
    }
  });

  it("applies the expected role boundaries", () => {
    const keysFor = (role: UserRole) =>
      getAuthorizedNavigation(DEFAULT_ROLE_PERMISSIONS[role], coreEntitlements).map(
        (route) => route.key,
      );

    expect(keysFor("teacher")).toEqual(expect.arrayContaining([
      "students.root",
      "academics.root",
      "attendance.root",
    ]));
    expect(keysFor("teacher")).not.toContain("finance.fees");
    expect(keysFor("parent")).toContain("finance.fees");
    expect(keysFor("parent")).not.toContain("payroll.root");
    expect(keysFor("librarian")).toContain("library.root");
    expect(keysFor("librarian")).not.toContain("hr.root");
    expect(keysFor("accountant")).toEqual(expect.arrayContaining([
      "payroll.root",
      "finance.fees",
      "finance.accounting",
    ]));
    expect(keysFor("student")).toContain("communications.root");
    expect(keysFor("admin")).toContain("administration.root");
    expect(keysFor("superadmin")).toContain("administration.root");
  });

  it.each([
    ["/students", ["Student Lifecycle", "Students"]],
    ["/hr/staff", ["People", "Human Resources", "Staff"]],
    ["/finance/fees", ["Finance", "Fees & Billing"]],
    ["/administration/users", ["Administration", "Administration", "Users"]],
  ] as const)("builds breadcrumbs for %s", (pathname, labels) => {
    expect(getBreadcrumbsForPath(pathname).map((item) => item.label)).toEqual(labels);
  });

  it("represents each module exactly once at root level", () => {
    const modules = getModuleRoutes().map((route) => route.module);
    expect(new Set(modules).size).toBe(modules.length);
  });

  it.each([
    "/dashboard",
    "/admin-dashboard",
    "/academics",
    "/attendance",
    "/timetable",
    "/exams",
    "/admissions",
    "/students",
    "/staff",
    "/payroll",
    "/fees",
    "/vehicles",
    "/library",
    "/labs",
    "/communications",
    "/mobile",
    "/intelligence",
    "/ai-studio",
    "/admin",
    "/users",
    "/settings",
  ])("maps the current live route %s", (pathname) => {
    expect(findRouteForPath(pathname)).toBeDefined();
  });
});

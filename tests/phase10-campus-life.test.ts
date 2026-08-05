import { Pool } from "pg";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { PERMISSIONS } from "@/lib/db";
import { findRouteForPath, getAuthorizedNavigation } from "@/lib/navigation/route-registry";
import { calculateCurrentValue, stockStatus } from "@/lib/phase10/inventory";
import { hasHealthRecordAccess } from "@/lib/phase10/shared";

const PHASE10_TABLES = [
  "hostel_buildings",
  "hostel_rooms",
  "hostel_allocations",
  "hostel_leave_passes",
  "vendors",
  "inventory_categories",
  "inventory_items",
  "inventory_stock",
  "inventory_transactions",
  "purchase_requisitions",
  "purchase_requisition_items",
  "assets",
  "asset_condition_history",
  "facility_spaces",
  "facility_bookings",
  "facility_work_orders",
  "visitor_records",
  "health_records",
  "activities",
  "activity_members",
  "activity_events",
  "student_achievements",
] as const;

describe("Phase 10 campus life and operations", () => {
  it("enables and forces RLS on every Phase 10 tenant table", async () => {
    const opsUrl = process.env.OPS_DATABASE_URL;
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    const ops = new Pool({ connectionString: opsUrl, max: 1 });
    try {
      const rls = await ops.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [PHASE10_TABLES],
      );
      expect(rls.rows).toHaveLength(PHASE10_TABLES.length);
      for (const row of rls.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await ops.end();
    }
  });

  it("keeps Phase 10 permissions in the static catalog with health restricted", () => {
    expect(PERMISSIONS).toEqual(expect.arrayContaining([
      "hostel.read",
      "hostel.allocations.manage",
      "inventory.stock.manage",
      "inventory.assets.read",
      "facilities.work-orders.create",
      "facilities.health.manage",
      "activities.achievements.manage",
    ]));
    expect(DEFAULT_ROLE_PERMISSIONS.admin).toContain("facilities.health.manage");
    expect(DEFAULT_ROLE_PERMISSIONS.teacher).not.toContain("facilities.health.manage");
    expect(DEFAULT_ROLE_PERMISSIONS.accountant).not.toContain("facilities.health.manage");
    expect(DEFAULT_ROLE_PERMISSIONS.librarian).not.toContain("facilities.health.manage");
    expect(hasHealthRecordAccess(DEFAULT_ROLE_PERMISSIONS.teacher)).toBe(false);
    expect(hasHealthRecordAccess(["facilities.health.manage"])).toBe(true);
  });

  it("calculates inventory stock status and straight-line asset depreciation", () => {
    expect(stockStatus(0, 5)).toBe("out");
    expect(stockStatus(4, 5)).toBe("low");
    expect(stockStatus(6, 5)).toBe("ok");
    expect(calculateCurrentValue(
      10_000_000,
      0,
      5,
      new Date("2023-01-01T00:00:00Z"),
      "straight_line",
      new Date("2026-01-02T00:00:00Z"),
    )).toBe(4_000_000);
  });

  it("marks Phase 10 routes as live and hides health from non-medical roles", () => {
    expect(findRouteForPath("/hostel/rooms")?.status).toBe("live");
    expect(findRouteForPath("/inventory/items")?.status).toBe("live");
    expect(findRouteForPath("/inventory/assets")?.status).toBe("live");
    expect(findRouteForPath("/facilities/work-orders")?.status).toBe("live");
    expect(findRouteForPath("/facilities/health")?.requiredPermission).toBe("facilities.health.manage");
    expect(findRouteForPath("/activities/catalog")?.status).toBe("live");

    const teacherRoutes = getAuthorizedNavigation(DEFAULT_ROLE_PERMISSIONS.teacher, ["module.students"]);
    const facilities = teacherRoutes.find((route) => route.key === "facilities.root");
    expect(facilities?.children?.map((route) => route.key)).not.toContain("facilities.health");
  });
});

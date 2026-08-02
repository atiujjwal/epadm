import { describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

vi.mock("server-only", () => ({}));

import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { PERMISSIONS } from "@/lib/db";
import { findRouteForPath } from "@/lib/navigation/route-registry";
import { calculateLibraryFine } from "@/lib/phase9/library";
import { consumableWouldGoNegative } from "@/lib/phase9/laboratories";
import { isGpsKeyValid } from "@/lib/phase9/transport";

const PHASE9_TABLES = [
  "vehicle_routes",
  "route_stops",
  "student_transport_allocations",
  "vehicle_maintenance_records",
  "vehicle_tracking_events",
  "library_titles",
  "library_copies",
  "library_members",
  "library_settings",
  "library_issues",
  "library_fines",
  "library_acquisitions",
  "library_acquisition_items",
  "laboratories",
  "lab_equipment",
  "lab_consumables",
  "lab_safety_incidents",
] as const;

describe("Phase 9 campus operations", () => {
  it("enables and forces RLS on every Phase 9 tenant table", async () => {
    const opsUrl = process.env.OPS_DATABASE_URL;
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    const ops = new Pool({ connectionString: opsUrl, max: 1 });
    try {
      const rls = await ops.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [PHASE9_TABLES],
      );
      expect(rls.rows).toHaveLength(PHASE9_TABLES.length);
      for (const row of rls.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await ops.end();
    }
  });

  it("keeps Phase 9 permissions in the static catalog and grants librarian workflows", () => {
    expect(PERMISSIONS).toEqual(expect.arrayContaining([
      "transport.fleet.write",
      "transport.routes.manage",
      "transport.allocations.manage",
      "library.catalog.manage",
      "library.circulation.manage",
      "laboratories.bookings.manage",
      "laboratories.inventory.manage",
    ]));
    expect(DEFAULT_ROLE_PERMISSIONS.librarian).toEqual(expect.arrayContaining([
      "library.read",
      "library.catalog.manage",
      "library.circulation.manage",
      "library.acquisitions.manage",
    ]));
  });

  it("calculates overdue library fines by day", () => {
    expect(calculateLibraryFine({ dueDate: "2026-07-01", returnedAt: "2026-07-05", finePerDayPaise: 500 })).toEqual({
      daysOverdue: 4,
      finePaise: 2000,
    });
    expect(calculateLibraryFine({ dueDate: "2026-07-05", returnedAt: "2026-07-01", finePerDayPaise: 500 }).finePaise).toBe(0);
  });

  it("validates GPS webhook keys against active tenant integration config", () => {
    expect(isGpsKeyValid("secret", { status: "active", apiKeyHash: "secret", config: {} })).toBe(true);
    expect(isGpsKeyValid("secret", { status: "active", apiKeyHash: null, config: { gpsApiKey: "secret" } })).toBe(true);
    expect(isGpsKeyValid("secret", { status: "inactive", apiKeyHash: "secret", config: {} })).toBe(false);
  });

  it("blocks negative laboratory consumable stock", () => {
    expect(consumableWouldGoNegative("10", -9)).toBe(false);
    expect(consumableWouldGoNegative("10", -11)).toBe(true);
  });

  it("marks canonical and legacy campus routes as discoverable", () => {
    expect(findRouteForPath("/transport/fleet")?.status).toBe("live");
    expect(findRouteForPath("/library/catalog")?.status).toBe("live");
    expect(findRouteForPath("/laboratories/bookings")?.status).toBe("live");
    expect(findRouteForPath("/vehicles")?.path).toBe("/transport");
    expect(findRouteForPath("/labs")?.path).toBe("/laboratories");
  });
});

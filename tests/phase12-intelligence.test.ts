import { Pool } from "pg";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { PERMISSIONS } from "@/lib/db";
import { findRouteForPath } from "@/lib/navigation/route-registry";
import { AI_FEATURES } from "@/lib/phase12/ai-studio";
import { getReportDefinition, listReportCatalog, toCsv } from "@/lib/phase12/reports";

const PHASE12_TABLES = [
  "analytics_snapshots",
  "report_runs",
  "report_schedules",
  "ai_generations",
  "ai_knowledge_base",
  "ai_settings",
] as const;

describe("Phase 12 analytics, reports, and AI Studio", () => {
  it("enables and forces RLS on every Phase 12 tenant table", async () => {
    const opsUrl = process.env.OPS_DATABASE_URL;
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    const ops = new Pool({ connectionString: opsUrl, max: 1 });
    try {
      const rls = await ops.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [PHASE12_TABLES],
      );
      expect(rls.rows).toHaveLength(PHASE12_TABLES.length);
      for (const row of rls.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await ops.end();
    }
  });

  it("keeps Phase 12 permissions and role grants in the static catalog", () => {
    expect(PERMISSIONS).toEqual(expect.arrayContaining([
      "analytics.academic.read",
      "finance.analytics.read",
      "hr.analytics.read",
      "reports.run",
      "reports.schedule.manage",
      "ai-studio.use",
      "ai-studio.governance",
      "ai-studio.settings",
    ]));
    expect(DEFAULT_ROLE_PERMISSIONS.teacher).toEqual(expect.arrayContaining(["analytics.academic.read", "reports.run", "ai-studio.use"]));
    expect(DEFAULT_ROLE_PERMISSIONS.teacher).not.toContain("ai-studio.governance");
    expect(DEFAULT_ROLE_PERMISSIONS.accountant).toContain("finance.analytics.read");
    expect(DEFAULT_ROLE_PERMISSIONS.accountant).not.toContain("hr.analytics.read");
  });

  it("registers Analytics and AI Studio live routes", () => {
    expect(findRouteForPath("/analytics")?.status).toBe("live");
    expect(findRouteForPath("/intelligence")?.path).toBe("/analytics");
    expect(findRouteForPath("/analytics/reports/schedules")?.requiredPermission).toBe("reports.schedule.manage");
    expect(findRouteForPath("/ai-studio")?.status).toBe("live");
    expect(findRouteForPath("/ai-studio/governance")?.requiredPermission).toBe("ai-studio.governance");
  });

  it("defines curated reports and escapes CSV output", () => {
    expect(listReportCatalog().map((report) => report.key)).toEqual(expect.arrayContaining(["student_directory", "fee_defaulters", "payroll_register"]));
    const report = getReportDefinition("student_directory");
    expect(report.requiredPermission).toBe("analytics.academic.read");
    expect(toCsv([{ key: "name", label: "Name" }], [{ name: "Asha, Rao" }])).toBe('Name\n"Asha, Rao"');
  });

  it("exposes governed AI Studio features", () => {
    expect(AI_FEATURES.map((feature) => feature.key)).toEqual(["exam_generator", "lesson_planner", "report_card_comments", "communication_writer"]);
  });
});

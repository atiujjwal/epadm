import { existsSync, readFileSync } from "node:fs";
import { Pool } from "pg";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import nextConfig from "../next.config";
import { PERMISSIONS } from "@/lib/db";
import { findRouteForPath, getAllRoutes } from "@/lib/navigation/route-registry";
import { DATA_RETENTION_POLICY } from "@/lib/governance/retention";
import { RATE_LIMITS, rateLimit } from "@/lib/security/rate-limit";

const PHASE13_TABLES = ["privacy_erasure_requests"] as const;

describe("Phase 13 platform hardening", () => {
  it("configures production security headers", async () => {
    expect(typeof nextConfig.headers).toBe("function");
    const headers = await nextConfig.headers!();
    const all = headers.flatMap((entry) => entry.headers);
    expect(all).toEqual(expect.arrayContaining([
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ]));
    expect(all.find((header) => header.key === "Content-Security-Policy")?.value).toContain("object-src 'none'");
  });

  it("enforces reusable rate-limit windows", () => {
    const key = `phase13-test-${crypto.randomUUID()}`;
    for (let i = 0; i < RATE_LIMITS.aiGenerate.maxRequests; i += 1) {
      expect(rateLimit(RATE_LIMITS.aiGenerate, key).allowed).toBe(true);
    }
    const blocked = rateLimit(RATE_LIMITS.aiGenerate, key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("keeps session cookies strict", () => {
    const tenantLogin = readFileSync("src/app/api/auth/login/route.ts", "utf8");
    const platformLogin = readFileSync("src/app/api/platform/auth/login/route.ts", "utf8");
    const platformMfa = readFileSync("src/app/api/platform/auth/mfa/route.ts", "utf8");
    for (const source of [tenantLogin, platformLogin, platformMfa]) {
      expect(source).toContain("httpOnly: true");
      expect(source).toContain("secure: process.env.NODE_ENV === \"production\"");
      expect(source).toContain("sameSite: \"strict\"");
    }
  });

  it("removes prototype/deprecation cleanup markers from app routes", () => {
    expect(readFileSync("src/app/root/[tenant]/[...module]/page.tsx", "utf8")).toContain("notFound()");
    expect(findRouteForPath("/analytics")?.status).toBe("live");
    expect(findRouteForPath("/administration/privacy")?.requiredPermission).toBe("administration.privacy.manage");
    expect(getAllRoutes().filter((route) => route.status === "broken")).toHaveLength(0);
    for (const route of getAllRoutes().filter((route) => route.status === "planned")) {
      expect(route.comingSoon).toBe(true);
    }
  });

  it("documents data governance and disaster recovery", () => {
    expect(PERMISSIONS).toContain("administration.privacy.manage");
    expect(DATA_RETENTION_POLICY.audit_logs.immutable).toBe(true);
    expect(DATA_RETENTION_POLICY.tracking_events.days).toBe(90);
    expect(existsSync("docs/DR_RUNBOOK.md")).toBe(true);
    expect(existsSync("docs/ENV_VARS.md")).toBe(true);
    expect(existsSync("scripts/verify-backup.ps1")).toBe(true);
  });

  it("enables and forces RLS on Phase 13 tenant tables", async () => {
    const opsUrl = process.env.OPS_DATABASE_URL;
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    const ops = new Pool({ connectionString: opsUrl, max: 1 });
    try {
      const rls = await ops.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [PHASE13_TABLES],
      );
      expect(rls.rows).toHaveLength(PHASE13_TABLES.length);
      for (const row of rls.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await ops.end();
    }
  });
});

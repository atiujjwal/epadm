import { Pool } from "pg";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { PERMISSIONS } from "@/lib/db";
import { findRouteForPath } from "@/lib/navigation/route-registry";
import { renderTemplate } from "@/lib/phase11/shared";

const PHASE11_TABLES = [
  "notification_templates",
  "notification_preferences",
  "notifications_queue",
  "announcements",
  "announcement_reads",
  "parent_messages",
  "document_templates",
  "generated_documents",
  "assignment_submissions",
] as const;

describe("Phase 11 communications, portals, and documents", () => {
  it("enables and forces RLS on every Phase 11 tenant table", async () => {
    const opsUrl = process.env.OPS_DATABASE_URL;
    if (!opsUrl) throw new Error("OPS_DATABASE_URL is required");
    const ops = new Pool({ connectionString: opsUrl, max: 1 });
    try {
      const rls = await ops.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [PHASE11_TABLES],
      );
      expect(rls.rows).toHaveLength(PHASE11_TABLES.length);
      for (const row of rls.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await ops.end();
    }
  });

  it("keeps Phase 11 permissions in the static catalog", () => {
    expect(PERMISSIONS).toEqual(expect.arrayContaining([
      "communications.announcements.manage",
      "communications.queue.manage",
      "communications.messages.manage",
      "documents.templates.manage",
      "documents.generate",
      "digital-experience.configure",
    ]));
    expect(DEFAULT_ROLE_PERMISSIONS.parent).toEqual(expect.arrayContaining(["communications.read", "documents.read"]));
    expect(DEFAULT_ROLE_PERMISSIONS.student).toEqual(expect.arrayContaining(["communications.read", "documents.read"]));
    expect(DEFAULT_ROLE_PERMISSIONS.teacher).not.toContain("communications.queue.manage");
  });

  it("marks Phase 11 routes as live", () => {
    expect(findRouteForPath("/communications/announcements")?.status).toBe("live");
    expect(findRouteForPath("/communications/queue")?.requiredPermission).toBe("communications.queue.manage");
    expect(findRouteForPath("/documents/generate")?.status).toBe("live");
    expect(findRouteForPath("/digital-experience")?.status).toBe("live");
  });

  it("renders placeholder templates with nested values", () => {
    expect(renderTemplate("Hello {{student.name}} from {{school}}", { student: { name: "Asha" }, school: "EPADM" })).toBe("Hello Asha from EPADM");
  });
});

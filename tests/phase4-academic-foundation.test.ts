import { describe, expect, it } from "vitest";
import { Pool } from "pg";

const TABLES = [
  "academic_terms",
  "campuses",
  "rooms",
  "school_houses",
  "curriculum_frameworks",
  "curriculum_offerings",
  "teacher_allocations",
  "timetable_periods",
  "timetable_versions",
  "timetable_slots",
] as const;

const TIMETABLE_UNIQUES = [
  "timetable_slots_version_section_period_day_unique",
  "timetable_slots_version_staff_period_day_unique",
  "timetable_slots_version_room_period_day_unique",
] as const;

describe("Phase 4 academic foundation schema", () => {
  it("enables and forces tenant RLS on every new Phase 4 table", async () => {
    const url = process.env.OPS_DATABASE_URL;
    if (!url) throw new Error("OPS_DATABASE_URL is required");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const result = await pool.query(
        "select c.relname, c.relrowsecurity, c.relforcerowsecurity, count(p.policyname)::int as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname where n.nspname = 'public' and c.relname = any($1::text[]) group by c.relname, c.relrowsecurity, c.relforcerowsecurity",
        [TABLES],
      );
      expect(result.rows).toHaveLength(TABLES.length);
      for (const row of result.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
        expect(row.policies).toBeGreaterThan(0);
      }
    } finally {
      await pool.end();
    }
  });

  it("keeps the three timetable conflict unique indexes in place", async () => {
    const url = process.env.OPS_DATABASE_URL;
    if (!url) throw new Error("OPS_DATABASE_URL is required");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const result = await pool.query(
        "select indexname from pg_indexes where schemaname = 'public' and tablename = 'timetable_slots' and indexname = any($1::text[])",
        [TIMETABLE_UNIQUES],
      );
      expect(result.rows.map((row) => row.indexname).sort()).toEqual([...TIMETABLE_UNIQUES].sort());
    } finally {
      await pool.end();
    }
  });
});

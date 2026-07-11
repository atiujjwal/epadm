import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

/**
 * Cross-tenant Row-Level-Security probe.
 *
 * Proves the isolation guarantee end-to-end at the database layer:
 *   1. Two tenants are provisioned (setup runs on a BYPASSRLS connection,
 *      exactly as tenant provisioning does in production — see opsDb).
 *   2. A student row is inserted for each tenant.
 *   3. A probe connection sets `app.current_tenant` to tenant A and asserts it
 *      can read A's student but CANNOT read B's — the tenant_isolation_policy.
 *
 * The isolation assertion is only meaningful when the probe role does NOT
 * bypass RLS (i.e. it is the non-superuser epadm_app role). When the probe role
 * bypasses RLS (e.g. the default local `postgres` superuser), the DB cannot
 * enforce the policy and the isolation assertion is skipped with a warning.
 * CI points APP_TEST_DATABASE_URL at epadm_app so the guarantee is enforced.
 */

const SETUP_URL = process.env.OPS_DATABASE_URL ?? process.env.DATABASE_URL;
const PROBE_URL =
  process.env.APP_TEST_DATABASE_URL ?? process.env.DATABASE_URL;

const stamp = `${Date.now()}`;
const slugA = `rls-probe-a-${stamp}`;
const slugB = `rls-probe-b-${stamp}`;

let setupPool: Pool;
let probePool: Pool;
let tenantAId: string;
let tenantBId: string;
let probeRoleBypassesRls = true;
let probeRoleName = "unknown";

describe("cross-tenant RLS isolation", () => {
  beforeAll(async () => {
    if (!SETUP_URL || !PROBE_URL) {
      throw new Error(
        "DATABASE_URL (and optionally OPS_DATABASE_URL / APP_TEST_DATABASE_URL) must be set to run the RLS probe.",
      );
    }

    setupPool = new Pool({ connectionString: SETUP_URL, max: 2 });
    probePool = new Pool({ connectionString: PROBE_URL, max: 2 });

    // Inspect the probe role: RLS (even FORCE) is bypassed by superusers and
    // BYPASSRLS roles, so the isolation assertion only holds for a plain role.
    const roleInfo = await probePool.query<{
      current_user: string;
      rolsuper: boolean;
      rolbypassrls: boolean;
    }>(
      `SELECT current_user,
              (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS rolsuper,
              (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) AS rolbypassrls`,
    );
    probeRoleName = roleInfo.rows[0]?.current_user ?? "unknown";
    probeRoleBypassesRls = Boolean(
      roleInfo.rows[0]?.rolsuper || roleInfo.rows[0]?.rolbypassrls,
    );

    // Provision two tenants + one student each on the BYPASSRLS setup connection
    // (matches production provisioning, which is inherently cross-tenant).
    const tenantA = await setupPool.query<{ id: string }>(
      `INSERT INTO tenants (name, slug, subscription_tier, is_active)
       VALUES ($1, $2, 'basic', true) RETURNING id`,
      ["RLS Probe Tenant A", slugA],
    );
    const tenantB = await setupPool.query<{ id: string }>(
      `INSERT INTO tenants (name, slug, subscription_tier, is_active)
       VALUES ($1, $2, 'basic', true) RETURNING id`,
      ["RLS Probe Tenant B", slugB],
    );
    tenantAId = tenantA.rows[0].id;
    tenantBId = tenantB.rows[0].id;

    await setupPool.query(
      `INSERT INTO students (tenant_id, admission_number, first_name, status)
       VALUES ($1, $2, $3, 'active')`,
      [tenantAId, `ADM-A-${stamp}`, "Alice A"],
    );
    await setupPool.query(
      `INSERT INTO students (tenant_id, admission_number, first_name, status)
       VALUES ($1, $2, $3, 'active')`,
      [tenantBId, `ADM-B-${stamp}`, "Bob B"],
    );
  });

  afterAll(async () => {
    // Cascade-deletes the seeded students via FK ON DELETE CASCADE.
    if (setupPool) {
      if (tenantAId) {
        await setupPool.query(`DELETE FROM tenants WHERE id = $1`, [tenantAId]);
      }
      if (tenantBId) {
        await setupPool.query(`DELETE FROM tenants WHERE id = $1`, [tenantBId]);
      }
      await setupPool.end();
    }
    if (probePool) {
      await probePool.end();
    }
  });

  it("sees its own tenant's rows when app.current_tenant is set", async () => {
    const client = await probePool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `SELECT set_config('app.current_tenant', $1, true)`,
        [tenantAId],
      );
      const own = await client.query(
        `SELECT id FROM students WHERE tenant_id = $1`,
        [tenantAId],
      );
      expect(own.rowCount).toBe(1);
      await client.query("COMMIT");
    } finally {
      client.release();
    }
  });

  it("cannot read another tenant's rows (RLS enforced at the DB)", async (ctx) => {
    if (probeRoleBypassesRls) {
      console.warn(
        `[rls-probe] SKIPPED isolation assertion: probe role "${probeRoleName}" ` +
          `is a superuser or has BYPASSRLS, so the tenant_isolation_policy cannot ` +
          `be enforced. Point APP_TEST_DATABASE_URL at the non-superuser epadm_app ` +
          `role to enforce this guarantee (this is what CI does).`,
      );
      ctx.skip();
      return;
    }

    const client = await probePool.connect();
    try {
      await client.query("BEGIN");
      // Scope the session to tenant A...
      await client.query(
        `SELECT set_config('app.current_tenant', $1, true)`,
        [tenantAId],
      );

      // ...then attempt to read tenant B's rows explicitly. The policy must
      // filter them out regardless of the WHERE clause.
      const cross = await client.query(
        `SELECT id FROM students WHERE tenant_id = $1`,
        [tenantBId],
      );
      expect(cross.rowCount).toBe(0);

      // And an unfiltered read must only ever return tenant A's row.
      const all = await client.query(`SELECT tenant_id FROM students`);
      for (const row of all.rows as Array<{ tenant_id: string }>) {
        expect(row.tenant_id).toBe(tenantAId);
      }

      await client.query("COMMIT");
    } finally {
      client.release();
    }
  });
});

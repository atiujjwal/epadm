import { Pool } from "pg";

// Global connection pool
// Source [513]: Shared database for all tenants to optimize connection usage
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Adjust based on DigitalOcean droplet size
  idleTimeoutMillis: 30000,
});

/**
 * Executes a database transaction with RLS context applied.
 * Source [571]: Invariant Implementation Pattern
 */
export async function withTenantTransaction<T>(
  tenantId: string,
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Source [575]: Set Context with is_local = true
    await client.query(`SELECT set_config('app.current_tenant', $1, true)`, [
      tenantId,
    ]);

    const result = await callback(client);

    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    // Source [578]: Connection returned to pool, context destroyed by COMMIT/ROLLBACK
    client.release();
  }
}

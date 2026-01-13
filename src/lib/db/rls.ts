import { PoolClient } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Executes a callback within a transaction that has the Tenant Context enforced.
 * This guarantees that RLS policies are active for every query in the block.
 */
export async function withTenantTransaction<T>(
  client: PoolClient,
  tenantId: string,
  callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>
): Promise<T> {
  try {
    // Start Transaction
    await client.query("BEGIN");

    // Set RLS Context (Local to this transaction)
    // The 'true' flag ensures it doesn't leak if connection is reused
    await client.query(`SELECT set_config('app.current_tenant', $1, true)`, [
      tenantId,
    ]);

    // Initialize Drizzle with schema
    const tx = drizzle(client, { schema });

    // Execute Business Logic
    const result = await callback(tx);

    // Commit
    await client.query("COMMIT");
    return result;
  } catch (error) {
    // Rollback on any error
    await client.query("ROLLBACK");
    throw error;
  }
}

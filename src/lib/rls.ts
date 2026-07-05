import { sql } from "drizzle-orm";
import { db } from "./db";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./db/schema";

/**
 * Executes a function within a transaction scoped to a specific tenant.
 *
 * This follows your architectural pattern:
 *   BEGIN;
 *   SELECT set_config('app.current_tenant', $tenantId, true);
 *   -- all queries here are RLS-scoped
 *   COMMIT;
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: NodePgDatabase<typeof schema>) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.current_tenant', ${tenantId}, true)`,
    );
    return fn(tx as unknown as NodePgDatabase<typeof schema>);
  });
}


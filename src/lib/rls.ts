import { sql } from "drizzle-orm";
import { db } from "./db";

export type TenantTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertTenantId(tenantId: string): void {
  if (typeof tenantId !== "string" || !UUID_PATTERN.test(tenantId)) {
    throw new Error("withTenant: tenantId must be a valid UUID");
  }
}

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
  fn: (tx: TenantTransaction) => Promise<T>,
): Promise<T> {
  assertTenantId(tenantId);

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.current_tenant', ${tenantId}, true)`,
    );
    return fn(tx);
  });
}


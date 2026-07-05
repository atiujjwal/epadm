import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Isolated ops_worker connection pool for the platform control plane.
 * Uses OPS_DATABASE_URL when set (ops_worker role with cross-tenant access);
 * falls back to DATABASE_URL in local development.
 */
const connectionString =
  process.env.OPS_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("OPS_DATABASE_URL or DATABASE_URL must be set");
}

const opsPool = new Pool({
  connectionString,
  max: 5,
});

export const opsDb = drizzle(opsPool, { schema });

export {
  platformOperators,
  tenantServices,
  tenantSubscriptions,
  tenantDailyMetrics,
  platformAuditLogs,
  tenants,
  users,
  tenantUsers,
  SERVICE_KEYS,
} from "./schema";
export type { ServiceKey, PlanTier } from "./schema";

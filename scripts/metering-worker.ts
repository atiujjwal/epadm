import "../src/lib/db/env-loader";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";
import { drainMeteringBuffer } from "../src/lib/platform/metering";

const connectionString =
  process.env.OPS_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("OPS_DATABASE_URL or DATABASE_URL must be set");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

async function flushAggregates() {
  const items = await drainMeteringBuffer(1000);
  if (items.length === 0) {
    console.log("No metering events to process.");
    return;
  }

  const grouped = new Map<string, { tokens: number; cost: number }>();

  for (const item of items) {
    const key = item.tenantId;
    const current = grouped.get(key) ?? { tokens: 0, cost: 0 };
    current.tokens += item.tokens;
    current.cost += item.cost;
    grouped.set(key, current);
  }

  for (const [tenantId, totals] of grouped.entries()) {
    await db.execute(sql`
      INSERT INTO platform.tenant_daily_metrics (tenant_id, log_date, total_ai_tokens, compute_cost_inr)
      VALUES (${tenantId}::uuid, CURRENT_DATE, ${totals.tokens}, ${totals.cost})
      ON CONFLICT (tenant_id, log_date)
      DO UPDATE SET
        total_ai_tokens = platform.tenant_daily_metrics.total_ai_tokens + EXCLUDED.total_ai_tokens,
        compute_cost_inr = platform.tenant_daily_metrics.compute_cost_inr + EXCLUDED.compute_cost_inr
    `);
  }

  console.log(`Aggregated ${items.length} metering events for ${grouped.size} tenants.`);
}

flushAggregates()
  .catch((error) => {
    console.error("Metering worker failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });

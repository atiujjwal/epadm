import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { tenants, users } from "../identity-tenancy/schema";

/**
 * SYNC LOGS
 * Tracks the health and performance of the offline-first sync engine.
 */
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),

    deviceId: text("device_id"), // Client-generated UUID for debugging specific phones

    syncType: text("sync_type").notNull(), // 'PULL' or 'PUSH'

    // Performance Metrics
    durationMs: integer("duration_ms"),
    changesCount: integer("changes_count").default(0),

    // Status
    status: text("status").default("SUCCESS").notNull(), // 'SUCCESS', 'FAILED'
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Optimized for "Show me sync failures for this tenant"
    tenantIdx: index("idx_sync_logs_tenant").on(table.tenantId, table.status),
    createdIdx: index("idx_sync_logs_created").on(table.createdAt),
  })
);

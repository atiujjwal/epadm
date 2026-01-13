import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants, users } from "../identity-tenancy/schema";

/**
 * CONSENT LOGS (DPDP Act)
 * Immutable audit trail for "Verifiable Parental Consent".
 */
export const consentLogs = pgTable(
  "consent_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),

    // Scope (e.g., "academic_records", "biometric")
    scope: text("scope").notNull(),

    // Parent's verified DID or hash from e-KYC
    parentDidHash: text("parent_did_hash").notNull(),

    // Verification Method (e.g., "aadhaar_otp")
    verificationMethod: text("verification_method").notNull(),

    status: text("status").notNull(), // 'granted', 'withdrawn'
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    ipAddress: text("ip_address"),
  },
  (table) => ({
    tenantUserIdx: index("idx_consent_tenant_user").on(
      table.tenantId,
      table.userId
    ),
  })
);

/**
 * AUDIT LOGS (General)
 * Tracks critical actions like deletions or grade changes.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    actorId: uuid("actor_id")
      .references(() => users.id)
      .notNull(),

    action: text("action").notNull(), // e.g., "DELETE_STUDENT"
    entityType: text("entity_type").notNull(), // "student"
    entityId: uuid("entity_id").notNull(),

    // Previous vs New state for rollback/audit
    changes: jsonb("changes"),

    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_audit_tenant").on(table.tenantId),
    timestampIdx: index("idx_audit_timestamp").on(table.timestamp),
  })
);

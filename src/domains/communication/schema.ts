import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants, users } from "../identity-tenancy/schema";

// --- ENUMS ---
export const noticePriorityEnum = pgEnum("notice_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
]);
export const messageTypeEnum = pgEnum("message_type", [
  "TEXT",
  "IMAGE",
  "DOCUMENT",
]);
export const notificationChannelEnum = pgEnum("notification_channel", [
  "SMS",
  "WHATSAPP",
  "PUSH",
  "EMAIL",
]);
export const notificationStatusEnum = pgEnum("notification_status", [
  "PENDING",
  "SENT",
  "FAILED",
  "DELIVERED",
]);

/**
 * NOTICES
 * Broadcast announcements (School Closed, Exam Schedule).
 * Synced to Mobile App.
 */
export const notices = pgTable(
  "notices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    title: text("title").notNull(),
    content: text("content").notNull(),
    priority: noticePriorityEnum("priority").default("NORMAL").notNull(),

    // Targeting: null = Public, or JSON array ["teacher", "student"]
    targetRoles: jsonb("target_roles"),

    authorId: uuid("author_id")
      .references(() => users.id)
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at"), // Auto-hide after date

    // Sync Columns
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantIdx: index("idx_notices_tenant").on(table.tenantId),
    syncIdx: index("idx_notices_sync").on(table.tenantId, table.updatedAt),
  })
);

/**
 * MESSAGES
 * Direct communication (Parent <-> Teacher).
 * Synced to Mobile App.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    senderId: uuid("sender_id")
      .references(() => users.id)
      .notNull(),
    recipientId: uuid("recipient_id").references(() => users.id), // Null if Group

    threadId: uuid("thread_id"), // For grouping conversations

    content: text("content"),
    type: messageTypeEnum("type").default("TEXT").notNull(),
    metadata: jsonb("metadata"), // For file URLs, image dimensions

    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),

    // Sync Columns
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    tenantThreadIdx: index("idx_messages_tenant_thread").on(
      table.tenantId,
      table.threadId
    ),
    recipientIdx: index("idx_messages_recipient").on(table.recipientId),
    syncIdx: index("idx_messages_sync").on(table.tenantId, table.updatedAt),
  })
);

/**
 * NOTIFICATION LOGS (Audit Trail)
 * Records of outbound alerts (SMS/WhatsApp).
 * NOT Synced to Mobile (Server-side log).
 */
export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),

    recipientUserId: uuid("recipient_user_id").references(() => users.id),
    recipientPhone: text("recipient_phone"), // Snapshot in case user changes phone later

    channel: notificationChannelEnum("channel").notNull(),
    status: notificationStatusEnum("status").default("PENDING").notNull(),

    templateId: text("template_id"), // External Template ID (DLT for SMS)
    content: text("content"), // The actual text sent

    providerResponse: jsonb("provider_response"), // Raw response from Twilio/Gupshup

    sentAt: timestamp("sent_at").defaultNow().notNull(),
    error: text("error"),
  },
  (table) => ({
    tenantDateIdx: index("idx_notif_logs_tenant_date").on(
      table.tenantId,
      table.sentAt
    ),
  })
);

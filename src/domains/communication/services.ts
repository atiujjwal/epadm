import { PoolClient } from "pg";
import { eq, and, gt, sql, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { notices, messages, notificationLogs } from "./schema";
import {
  CreateNoticeInput,
  SendMessageInput,
  SendNotificationInput,
} from "./types";
import { requirePermission } from "@/lib/auth/rbac";
// import { notificationQueue } from "@/lib/queue"; // Assumed BullMQ instance

// ==========================================
// NOTICES (Broadcasts)
// ==========================================

export async function createNotice(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: CreateNoticeInput
) {
  await requirePermission(client, userId, "communication.notice.write");
  const db = drizzle(client);

  const [notice] = await db
    .insert(notices)
    .values({
      tenantId,
      authorId: userId,
      title: data.title,
      content: data.content,
      priority: data.priority || "NORMAL",
      targetRoles: data.targetRoles,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      updatedAt: new Date(),
    })
    .returning();

  return notice;
}

export async function getActiveNotices(
  client: PoolClient,
  tenantId: string,
  userId: string
) {
  // Public read, or targeted based on role (logic simplified here)
  await requirePermission(client, userId, "communication.notice.read");
  const db = drizzle(client);

  return await db
    .select()
    .from(notices)
    .where(
      and(
        eq(notices.tenantId, tenantId),
        eq(notices.isActive, true),
        isNull(notices.deletedAt)
      )
    );
}

// ==========================================
// MESSAGES (Direct Chat)
// ==========================================

export async function sendMessage(
  client: PoolClient,
  tenantId: string,
  userId: string,
  data: SendMessageInput
) {
  await requirePermission(client, userId, "communication.message.write");
  const db = drizzle(client);

  // TODO: Validate that sender can message recipient (e.g., Parent -> Class Teacher only)

  const [message] = await db
    .insert(messages)
    .values({
      tenantId,
      senderId: userId,
      recipientId: data.recipientId,
      threadId: data.threadId, // Or generate new
      content: data.content,
      type: data.type || "TEXT",
      metadata: data.metadata,
      updatedAt: new Date(),
    })
    .returning();

  return message;
}

// ==========================================
// NOTIFICATIONS (Async Delivery)
// ==========================================

export async function dispatchNotification(
  client: PoolClient,
  tenantId: string,
  userId: string, // System user or Admin triggering this
  data: SendNotificationInput
) {
  // 1. Check Permissions
  // Usually called by system services (e.g. Attendance Worker), so check might be internal
  const db = drizzle(client);

  // 2. Create Audit Log (Status: PENDING)
  const [log] = await db
    .insert(notificationLogs)
    .values({
      tenantId,
      recipientUserId: data.userId,
      channel: data.channel,
      templateId: data.templateId,
      content: JSON.stringify(data.variables), // Store vars for now
      status: "PENDING",
    })
    .returning();

  // 3. Push to Redis Queue (Decoupled execution)
  // await notificationQueue.add("send-alert", {
  //   logId: log.id,
  //   tenantId,
  //   ...data
  // });

  return log;
}

// ==========================================
// MOBILE SYNC (WatermelonDB)
// ==========================================

export async function getCommunicationChanges(
  client: PoolClient,
  tenantId: string,
  userId: string,
  lastPulledAt: number
) {
  await requirePermission(client, userId, "communication.read");
  const db = drizzle(client);
  const since = new Date(lastPulledAt);

  // 1. Notices
  const updatedNotices = await db
    .select()
    .from(notices)
    .where(and(eq(notices.tenantId, tenantId), gt(notices.updatedAt, since)));

  const deletedNotices = await db
    .select({ id: notices.id })
    .from(notices)
    .where(
      and(
        eq(notices.tenantId, tenantId),
        gt(notices.updatedAt, since),
        sql`${notices.deletedAt} IS NOT NULL`
      )
    );

  // 2. Messages (Filtered by User)
  const updatedMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.tenantId, tenantId),
        gt(messages.updatedAt, since),
        sql`(${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId})`
      )
    );

  const deletedMessages = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.tenantId, tenantId),
        gt(messages.updatedAt, since),
        sql`(${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId})`,
        sql`${messages.deletedAt} IS NOT NULL`
      )
    );

  return {
    changes: {
      notices: {
        created: [],
        updated: updatedNotices.filter((n) => !n.deletedAt),
        deleted: deletedNotices.map((n) => n.id),
      },
      messages: {
        created: [],
        updated: updatedMessages.filter((m) => !m.deletedAt),
        deleted: deletedMessages.map((m) => m.id),
      },
    },
    timestamp: Date.now(),
  };
}

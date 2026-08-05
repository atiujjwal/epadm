import "server-only";

import { and, asc, desc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";
import {
  announcements,
  announcementReads,
  guardianProfiles,
  messageCampaigns,
  notificationPreferences,
  notificationsQueue,
  notificationTemplates,
  parentMessages,
  studentEnrollments,
  studentGuardians,
  students,
  tenantUsers,
  users,
  type UserRole,
} from "@/lib/db";
import { withTenant, type TenantTransaction } from "@/lib/rls";
import { clean, Phase11Error } from "./shared";

export type NotificationChannel = "sms" | "email" | "push";

const DEFAULT_TEMPLATES = [
  {
    name: "Attendance Alert",
    eventType: "attendance_alert",
    channel: "sms",
    bodySms: "Dear Parent, {{student_name}} was marked {{status}} on {{date}}. - {{school_name}}",
    variables: ["student_name", "status", "date", "school_name"],
  },
  {
    name: "Fee Overdue",
    eventType: "fee_overdue",
    channel: "sms",
    bodySms: "Dear Parent, {{student_name}} has overdue fees of {{amount}} due by {{due_date}}. - {{school_name}}",
    variables: ["student_name", "amount", "due_date", "school_name"],
  },
  {
    name: "Result Published",
    eventType: "result_published",
    channel: "email",
    subject: "Results published for {{student_name}}",
    bodyEmail: "Dear Parent, results for {{student_name}} are now available in the portal.",
    variables: ["student_name"],
  },
  {
    name: "Announcement",
    eventType: "announcement",
    channel: "push",
    bodyPush: "{{title}}",
    variables: ["title"],
  },
] as const;

export async function seedDefaultNotificationTemplates(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    return tx.insert(notificationTemplates).values(DEFAULT_TEMPLATES.map((template) => ({
      tenantId,
      ...template,
      variables: [...template.variables],
    }))).onConflictDoNothing().returning();
  });
}

export async function listCommunicationsModel(tenantId: string) {
  await seedDefaultNotificationTemplates(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [templateRows, announcementRows, queueRows, campaigns, messages] = await Promise.all([
      tx.select().from(notificationTemplates).where(eq(notificationTemplates.tenantId, tenantId)).orderBy(asc(notificationTemplates.name)),
      tx.select().from(announcements).where(eq(announcements.tenantId, tenantId)).orderBy(desc(announcements.createdAt)).limit(100),
      tx.select().from(notificationsQueue).where(eq(notificationsQueue.tenantId, tenantId)).orderBy(desc(notificationsQueue.createdAt)).limit(100),
      tx.select().from(messageCampaigns).where(eq(messageCampaigns.tenantId, tenantId)).orderBy(desc(messageCampaigns.createdAt)).limit(100),
      tx.select({
        id: parentMessages.id,
        subject: parentMessages.subject,
        body: parentMessages.body,
        direction: parentMessages.direction,
        createdAt: parentMessages.createdAt,
        studentName: students.firstName,
        admissionNumber: students.admissionNumber,
        guardianName: guardianProfiles.firstName,
      }).from(parentMessages)
        .innerJoin(students, eq(students.id, parentMessages.studentId))
        .innerJoin(guardianProfiles, eq(guardianProfiles.id, parentMessages.guardianId))
        .where(eq(parentMessages.tenantId, tenantId))
        .orderBy(desc(parentMessages.createdAt)).limit(100),
    ]);
    return { templates: templateRows, announcements: announcementRows, queue: queueRows, campaigns, messages };
  });
}

async function preferenceEnabled(tx: TenantTransaction, tenantId: string, userId: string | null | undefined, channel: NotificationChannel, eventType: string | null | undefined) {
  if (!userId || !eventType) return true;
  const [pref] = await tx.select({ isEnabled: notificationPreferences.isEnabled }).from(notificationPreferences)
    .where(and(eq(notificationPreferences.tenantId, tenantId), eq(notificationPreferences.userId, userId), eq(notificationPreferences.channel, channel), eq(notificationPreferences.eventType, eventType)))
    .limit(1);
  return pref?.isEnabled ?? true;
}

export async function queueNotification(tenantId: string, input: {
  templateId?: string | null;
  eventType?: string | null;
  recipientUserId?: string | null;
  recipientPhone?: string | null;
  recipientEmail?: string | null;
  channel: NotificationChannel;
  subject?: string | null;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  scheduledAt?: string | Date | null;
}) {
  return withTenant(tenantId, async (tx) => {
    if (!(await preferenceEnabled(tx, tenantId, input.recipientUserId, input.channel, input.eventType))) {
      return null;
    }
    const [row] = await tx.insert(notificationsQueue).values({
      tenantId,
      templateId: input.templateId ?? null,
      eventType: input.eventType ?? null,
      recipientUserId: input.recipientUserId ?? null,
      recipientPhone: clean(input.recipientPhone),
      recipientEmail: clean(input.recipientEmail),
      channel: input.channel,
      subject: clean(input.subject),
      body: input.body,
      entityType: clean(input.entityType),
      entityId: input.entityId ?? null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : new Date(),
    }).returning();
    return row;
  });
}

async function resolveRecipients(tx: TenantTransaction, tenantId: string, input: { targetRole?: string | null; targetClassId?: string | null; targetSectionId?: string | null }) {
  const directUsers = input.targetRole
    ? await tx.select({
        userId: users.id,
        email: users.email,
        phone: users.phone,
      }).from(tenantUsers)
        .innerJoin(users, eq(users.id, tenantUsers.userId))
        .where(and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.role, input.targetRole as UserRole), eq(tenantUsers.isActive, true)))
    : [];

  const guardianRows = input.targetClassId || input.targetSectionId
    ? await tx.select({
        userId: guardianProfiles.userId,
        email: guardianProfiles.email,
        phone: guardianProfiles.phonePrimary,
      }).from(studentEnrollments)
        .innerJoin(studentGuardians, eq(studentGuardians.studentId, studentEnrollments.studentId))
        .innerJoin(guardianProfiles, eq(guardianProfiles.id, studentGuardians.guardianId))
        .where(and(
          eq(studentEnrollments.tenantId, tenantId),
          input.targetClassId ? eq(studentEnrollments.classId, input.targetClassId) : sql`true`,
          input.targetSectionId ? eq(studentEnrollments.sectionId, input.targetSectionId) : sql`true`,
          eq(studentGuardians.portalAccess, true),
        ))
    : [];

  const merged = new Map<string, { userId: string | null; email: string | null; phone: string | null }>();
  for (const row of [...directUsers, ...guardianRows]) {
    const key = row.userId ?? row.email ?? row.phone ?? crypto.randomUUID();
    merged.set(key, row);
  }
  return [...merged.values()];
}

export async function createAnnouncement(tenantId: string, actorUserId: string, input: {
  title: string;
  body: string;
  announcementType?: string | null;
  priority?: string | null;
  targetRole?: string | null;
  targetClassId?: string | null;
  targetSectionId?: string | null;
  publish?: boolean;
  expiresAt?: string | Date | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const publish = input.publish ?? false;
    const [announcement] = await tx.insert(announcements).values({
      tenantId,
      title: input.title.trim(),
      body: input.body.trim(),
      announcementType: clean(input.announcementType) ?? "general",
      priority: clean(input.priority) ?? "normal",
      targetRole: clean(input.targetRole),
      targetClassId: input.targetClassId ?? null,
      targetSectionId: input.targetSectionId ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      isDraft: !publish,
      publishedAt: publish ? new Date() : null,
      createdBy: actorUserId,
    }).returning();

    let queued = 0;
    if (publish) {
      const recipients = await resolveRecipients(tx, tenantId, input);
      for (const recipient of recipients) {
        const channel: NotificationChannel = recipient.email ? "email" : "sms";
        if (!(await preferenceEnabled(tx, tenantId, recipient.userId, channel, "announcement"))) continue;
        await tx.insert(notificationsQueue).values({
          tenantId,
          eventType: "announcement",
          recipientUserId: recipient.userId,
          recipientPhone: recipient.phone,
          recipientEmail: recipient.email,
          channel,
          subject: announcement.title,
          body: announcement.body,
          entityType: "announcement",
          entityId: announcement.id,
        });
        queued++;
      }
    }
    return { announcement, queued };
  });
}

export async function listVisibleAnnouncements(tenantId: string, role: UserRole, userId: string, sectionIds: string[] = []) {
  return withTenant(tenantId, async (tx) => {
    const rows = await tx.select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      priority: announcements.priority,
      publishedAt: announcements.publishedAt,
      readAt: announcementReads.readAt,
    }).from(announcements)
      .leftJoin(announcementReads, and(eq(announcementReads.announcementId, announcements.id), eq(announcementReads.userId, userId)))
      .where(and(
        eq(announcements.tenantId, tenantId),
        eq(announcements.isDraft, false),
        or(isNull(announcements.targetRole), eq(announcements.targetRole, role)),
        sectionIds.length ? or(isNull(announcements.targetSectionId), inArray(announcements.targetSectionId, sectionIds)) : isNull(announcements.targetSectionId),
        or(isNull(announcements.expiresAt), lte(sql`now()`, announcements.expiresAt)),
      ))
      .orderBy(desc(announcements.publishedAt))
      .limit(50);
    return rows;
  });
}

export async function markAnnouncementRead(tenantId: string, userId: string, announcementId: string) {
  return withTenant(tenantId, async (tx) => {
    const [read] = await tx.insert(announcementReads).values({ tenantId, userId, announcementId })
      .onConflictDoNothing()
      .returning();
    return read ?? null;
  });
}

export async function updateNotificationPreference(tenantId: string, userId: string, input: { channel: NotificationChannel; eventType: string; isEnabled: boolean }) {
  return withTenant(tenantId, async (tx) => {
    const [pref] = await tx.insert(notificationPreferences).values({ tenantId, userId, ...input })
      .onConflictDoUpdate({
        target: [notificationPreferences.userId, notificationPreferences.channel, notificationPreferences.eventType],
        set: { isEnabled: input.isEnabled, updatedAt: new Date() },
      }).returning();
    return pref;
  });
}

export async function sendQueuedNotification(tenantId: string, queueId: string, ok: boolean, errorMessage?: string | null) {
  return withTenant(tenantId, async (tx) => {
    const [row] = await tx.update(notificationsQueue).set({
      status: ok ? "sent" : "failed",
      sentAt: ok ? new Date() : null,
      errorMessage: ok ? null : clean(errorMessage) ?? "Delivery failed",
      attempts: sql`${notificationsQueue.attempts} + 1`,
      updatedAt: new Date(),
    }).where(and(eq(notificationsQueue.tenantId, tenantId), eq(notificationsQueue.id, queueId))).returning();
    if (!row) throw new Phase11Error("Notification not found.", 404);
    return row;
  });
}

export async function createCampaignV2(tenantId: string, input: typeof messageCampaigns.$inferInsert) {
  return withTenant(tenantId, async (tx) => {
    const [campaign] = await tx.insert(messageCampaigns).values({ ...input, tenantId }).returning();
    return campaign;
  });
}

export async function createParentMessage(tenantId: string, actorUserId: string, input: {
  studentId: string;
  guardianId: string;
  subject: string;
  body: string;
  direction?: "parent_to_school" | "school_to_parent";
  replyToId?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [message] = await tx.insert(parentMessages).values({
      tenantId,
      studentId: input.studentId,
      guardianId: input.guardianId,
      subject: input.subject.trim(),
      body: input.body.trim(),
      direction: input.direction ?? "parent_to_school",
      replyToId: input.replyToId ?? null,
      createdBy: actorUserId,
      parentRead: input.direction === "school_to_parent" ? false : true,
      adminRead: input.direction === "parent_to_school" ? false : true,
    }).returning();
    return message;
  });
}

export async function announcementTargetsLabel(row: { targetRole: string | null; targetClassId: string | null; targetSectionId: string | null }) {
  if (row.targetSectionId) return "Section";
  if (row.targetClassId) return "Class";
  if (row.targetRole) return row.targetRole;
  return "Whole school";
}

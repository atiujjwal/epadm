import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import {
  activities,
  activityEvents,
  activityMembers,
  academicYears,
  staffProfiles,
  studentAchievements,
  students,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { clean, Phase10Error, writeAuditLog } from "./shared";

export async function listActivitiesModel(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [activityRows, memberRows, eventRows, achievementRows] = await Promise.all([
      tx.select({
        id: activities.id,
        name: activities.name,
        activityType: activities.activityType,
        schedule: activities.schedule,
        isActive: activities.isActive,
        coordinatorName: staffProfiles.fullName,
      }).from(activities)
        .leftJoin(staffProfiles, eq(staffProfiles.id, activities.coordinatorStaffId))
        .where(eq(activities.tenantId, tenantId))
        .orderBy(asc(activities.name)),
      tx.select({
        id: activityMembers.id,
        activityId: activityMembers.activityId,
        studentId: activityMembers.studentId,
        academicYearId: activityMembers.academicYearId,
        role: activityMembers.role,
        status: activityMembers.status,
        joinedDate: activityMembers.joinedDate,
        leftDate: activityMembers.leftDate,
        studentName: students.firstName,
        admissionNumber: students.admissionNumber,
        academicYearName: academicYears.name,
      }).from(activityMembers)
        .innerJoin(students, eq(students.id, activityMembers.studentId))
        .innerJoin(academicYears, eq(academicYears.id, activityMembers.academicYearId))
        .where(eq(activityMembers.tenantId, tenantId))
        .orderBy(desc(activityMembers.createdAt)),
      tx.select().from(activityEvents).where(eq(activityEvents.tenantId, tenantId)).orderBy(desc(activityEvents.eventDate)),
      tx.select({
        id: studentAchievements.id,
        studentId: studentAchievements.studentId,
        activityId: studentAchievements.activityId,
        eventId: studentAchievements.eventId,
        title: studentAchievements.title,
        achievementType: studentAchievements.achievementType,
        level: studentAchievements.level,
        position: studentAchievements.position,
        achievementDate: studentAchievements.achievementDate,
        awardedBy: studentAchievements.awardedBy,
        certificateUrl: studentAchievements.certificateUrl,
        studentName: students.firstName,
        admissionNumber: students.admissionNumber,
      }).from(studentAchievements)
        .innerJoin(students, eq(students.id, studentAchievements.studentId))
        .where(eq(studentAchievements.tenantId, tenantId))
        .orderBy(desc(studentAchievements.achievementDate)),
    ]);
    return { activities: activityRows, members: memberRows, events: eventRows, achievements: achievementRows };
  });
}

export async function createActivity(tenantId: string, actorUserId: string, input: {
  name: string;
  activityType?: string | null;
  coordinatorStaffId?: string | null;
  schedule?: string | null;
  description?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [activity] = await tx.insert(activities).values({
      tenantId,
      name: input.name.trim(),
      activityType: clean(input.activityType) ?? "sports",
      coordinatorStaffId: input.coordinatorStaffId ?? null,
      schedule: clean(input.schedule),
      description: clean(input.description),
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "activities.activity.created", entityType: "activity", entityId: activity.id });
    return activity;
  });
}

export async function addActivityMember(tenantId: string, actorUserId: string, input: {
  activityId: string;
  studentId: string;
  academicYearId: string;
  role?: string | null;
  joinedDate: string;
}) {
  return withTenant(tenantId, async (tx) => {
    const [existing] = await tx.select({ id: activityMembers.id }).from(activityMembers).where(and(
      eq(activityMembers.tenantId, tenantId),
      eq(activityMembers.activityId, input.activityId),
      eq(activityMembers.studentId, input.studentId),
      eq(activityMembers.academicYearId, input.academicYearId),
    )).limit(1);
    if (existing) throw new Phase10Error("Student is already a member of this activity for the selected academic year.", 409);
    const [member] = await tx.insert(activityMembers).values({
      tenantId,
      activityId: input.activityId,
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      role: clean(input.role) ?? "member",
      joinedDate: input.joinedDate,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "activities.member.added", entityType: "activity_member", entityId: member.id });
    return member;
  });
}

export async function removeActivityMember(tenantId: string, actorUserId: string, memberId: string, leftDate: string) {
  return withTenant(tenantId, async (tx) => {
    const [member] = await tx.update(activityMembers).set({ status: "inactive", leftDate, updatedAt: new Date() })
      .where(and(eq(activityMembers.tenantId, tenantId), eq(activityMembers.id, memberId))).returning();
    if (!member) throw new Phase10Error("Activity member not found.", 404);
    await writeAuditLog(tx, { tenantId, actorUserId, action: "activities.member.removed", entityType: "activity_member", entityId: memberId });
    return member;
  });
}

export async function createActivityEvent(tenantId: string, actorUserId: string, input: {
  activityId: string;
  name: string;
  eventDate: string;
  level?: string | null;
  venue?: string | null;
  result?: string | null;
  notes?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [event] = await tx.insert(activityEvents).values({
      tenantId,
      activityId: input.activityId,
      name: input.name.trim(),
      eventDate: input.eventDate,
      level: clean(input.level) ?? "school",
      venue: clean(input.venue),
      result: clean(input.result),
      notes: clean(input.notes),
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "activities.event.created", entityType: "activity_event", entityId: event.id });
    return event;
  });
}

export async function recordStudentAchievement(tenantId: string, actorUserId: string, input: {
  studentId: string;
  activityId?: string | null;
  eventId?: string | null;
  academicYearId?: string | null;
  title: string;
  achievementType?: string | null;
  level?: string | null;
  position?: string | null;
  achievementDate: string;
  awardedBy?: string | null;
  certificateUrl?: string | null;
}) {
  return withTenant(tenantId, async (tx) => {
    const [achievement] = await tx.insert(studentAchievements).values({
      tenantId,
      studentId: input.studentId,
      activityId: input.activityId ?? null,
      eventId: input.eventId ?? null,
      academicYearId: input.academicYearId ?? null,
      title: input.title.trim(),
      achievementType: clean(input.achievementType) ?? "participation",
      level: clean(input.level) ?? "school",
      position: clean(input.position),
      achievementDate: input.achievementDate,
      awardedBy: clean(input.awardedBy),
      certificateUrl: clean(input.certificateUrl),
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "activities.achievement.recorded", entityType: "student_achievement", entityId: achievement.id });
    return achievement;
  });
}

export async function getStudentActivitiesSummary(tenantId: string, studentId: string) {
  return withTenant(tenantId, async (tx) => {
    const memberships = await tx.select({
      id: activityMembers.id,
      activityId: activityMembers.activityId,
      activityName: activities.name,
      role: activityMembers.role,
      status: activityMembers.status,
      joinedDate: activityMembers.joinedDate,
      leftDate: activityMembers.leftDate,
      academicYearId: activityMembers.academicYearId,
      academicYearName: academicYears.name,
    }).from(activityMembers)
      .innerJoin(activities, eq(activities.id, activityMembers.activityId))
      .innerJoin(academicYears, eq(academicYears.id, activityMembers.academicYearId))
      .where(and(eq(activityMembers.tenantId, tenantId), eq(activityMembers.studentId, studentId)))
      .orderBy(desc(activityMembers.createdAt));
    const achievements = await tx.select({
      id: studentAchievements.id,
      title: studentAchievements.title,
      achievementType: studentAchievements.achievementType,
      level: studentAchievements.level,
      position: studentAchievements.position,
      achievementDate: studentAchievements.achievementDate,
      awardedBy: studentAchievements.awardedBy,
      certificateUrl: studentAchievements.certificateUrl,
      activityName: activities.name,
    }).from(studentAchievements)
      .leftJoin(activities, eq(activities.id, studentAchievements.activityId))
      .where(and(eq(studentAchievements.tenantId, tenantId), eq(studentAchievements.studentId, studentId)))
      .orderBy(desc(studentAchievements.achievementDate));
    return { memberships, achievements };
  });
}

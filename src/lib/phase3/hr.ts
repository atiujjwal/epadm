import "server-only";

import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { staffProfiles, staffQualifications } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export async function listHrStaff(tenantId: string, q?: string) {
  return withTenant(tenantId, (tx) => tx.select().from(staffProfiles).where(and(
    eq(staffProfiles.tenantId, tenantId),
    q ? or(ilike(staffProfiles.fullName, `%${q}%`), ilike(staffProfiles.employeeCode, `%${q}%`), ilike(staffProfiles.email, `%${q}%`)) : undefined,
  )).orderBy(asc(staffProfiles.fullName)));
}

export async function getHrStaff(tenantId: string, staffId: string) {
  return withTenant(tenantId, async (tx) => {
    const staff = await tx.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId)) });
    if (!staff) return null;
    const qualifications = await tx.select().from(staffQualifications).where(and(eq(staffQualifications.tenantId, tenantId), eq(staffQualifications.staffId, staffId))).orderBy(desc(staffQualifications.createdAt));
    return { staff, qualifications };
  });
}

export async function createHrStaff(tenantId: string, actorUserId: string, input: Omit<typeof staffProfiles.$inferInsert, "id" | "tenantId" | "createdAt" | "updatedAt">) {
  return withTenant(tenantId, async (tx) => {
    const code = input.employeeCode.trim().toUpperCase();
    const exists = await tx.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.employeeCode, code)) });
    if (exists) throw new Error("A staff member with this employee number already exists");
    const [staff] = await tx.insert(staffProfiles).values({ ...input, tenantId, employeeCode: code, fullName: input.fullName.trim(), phone: input.phonePrimary || input.phone || null }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "staff.created", entityType: "staff_profile", entityId: staff.id, metadata: { employeeCode: code } });
    return staff;
  });
}

export async function updateHrStaff(tenantId: string, actorUserId: string, staffId: string, input: Partial<typeof staffProfiles.$inferInsert>) {
  return withTenant(tenantId, async (tx) => {
    const safe = { ...input };
    delete safe.id;
    delete safe.tenantId;
    delete safe.createdAt;
    const [staff] = await tx.update(staffProfiles).set({ ...safe, updatedAt: new Date() }).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId))).returning();
    if (!staff) throw new Error("Staff record not found");
    await writeAuditLog(tx, { tenantId, actorUserId, action: "staff.updated", entityType: "staff_profile", entityId: staffId, metadata: { fields: Object.keys(safe) } });
    return staff;
  });
}

export async function archiveHrStaff(tenantId: string, actorUserId: string, staffId: string, input: { reason: string; effectiveDate: string }) {
  if (!input.reason.trim()) throw new Error("A reason is required");
  return withTenant(tenantId, async (tx) => {
    const current = await tx.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId)) });
    if (!current) throw new Error("Staff record not found");
    if (current.archivedAt) throw new Error("Staff record is already archived");
    const [staff] = await tx.update(staffProfiles).set({ status: "inactive", archivedAt: new Date(), archiveReason: input.reason.trim(), leavingDate: input.effectiveDate, updatedAt: new Date() }).where(and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "staff.archived", entityType: "staff_profile", entityId: staffId, metadata: { reason: input.reason, effectiveDate: input.effectiveDate } });
    return staff;
  });
}

export async function addQualification(tenantId: string, staffId: string, input: { degree: string; institution: string; boardOrUniversity?: string; yearOfPassing?: string; gradeOrPercentage?: string }) {
  return withTenant(tenantId, async (tx) => {
    const staff = await tx.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenantId), eq(staffProfiles.id, staffId)) });
    if (!staff) throw new Error("Staff record not found");
    const [qualification] = await tx.insert(staffQualifications).values({ tenantId, staffId, ...input }).returning(); return qualification;
  });
}
export async function removeQualification(tenantId: string, staffId: string, qualificationId: string) { return withTenant(tenantId, async (tx) => { const [item] = await tx.delete(staffQualifications).where(and(eq(staffQualifications.tenantId, tenantId), eq(staffQualifications.staffId, staffId), eq(staffQualifications.id, qualificationId))).returning(); if (!item) throw new Error("Qualification not found"); return item; }); }

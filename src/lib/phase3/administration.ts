import "server-only";

import argon2 from "argon2";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import {
  auditLogs,
  customRoleGrants,
  customRoles,
  tenantIntegrations,
  tenants,
  tenantUsers,
  users,
  type Permission,
  type UserRole,
} from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { withTenant } from "@/lib/rls";

export const ROLE_HIERARCHY: readonly UserRole[] = [
  "student", "parent", "staff", "librarian", "accountant", "teacher", "hr", "admin", "superadmin",
];

export function assertAssignableRole(assignerRole: UserRole, targetRole: UserRole) {
  if (ROLE_HIERARCHY.indexOf(targetRole) > ROLE_HIERARCHY.indexOf(assignerRole)) {
    throw new Error("FORBIDDEN: Cannot assign a role higher than your own");
  }
}

export async function getSchoolProfile(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [school] = await tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!school) throw new Error("School not found");
    return school;
  });
}

export async function updateSchoolProfile(
  tenantId: string,
  actorUserId: string,
  input: { name?: string; logoUrl?: string | null; email?: string | null; phone?: string | null; address?: string | null; city?: string | null; state?: string | null; pincode?: string | null; affiliationBoard?: string | null; settings?: Record<string, unknown> },
) {
  return withTenant(tenantId, async (tx) => {
    const current = await tx.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
    if (!current) throw new Error("School not found");
    const [school] = await tx.update(tenants).set({
      ...input,
      settings: input.settings ? { ...current.settings, ...input.settings } : current.settings,
      updatedAt: new Date(),
    }).where(eq(tenants.id, tenantId)).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "school.updated", entityType: "tenant", entityId: tenantId, metadata: { fields: Object.keys(input) } });
    return school;
  });
}

export async function listMemberships(tenantId: string, filters: { q?: string; role?: UserRole; status?: string } = {}) {
  return withTenant(tenantId, (tx) => tx.select({
    membershipId: tenantUsers.id,
    userId: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
    role: tenantUsers.role,
    customRoleId: tenantUsers.customRoleId,
    status: tenantUsers.membershipStatus,
    isActive: tenantUsers.isActive,
    joinedAt: tenantUsers.joinedAt,
    invitedAt: tenantUsers.invitedAt,
    lastLoginAt: users.lastLoginAt,
  }).from(tenantUsers).innerJoin(users, eq(tenantUsers.userId, users.id)).where(and(
    eq(tenantUsers.tenantId, tenantId),
    filters.q ? or(ilike(users.name, `%${filters.q}%`), ilike(users.email, `%${filters.q}%`)) : undefined,
    filters.role ? eq(tenantUsers.role, filters.role) : undefined,
    filters.status ? eq(tenantUsers.membershipStatus, filters.status as "active" | "invited" | "deactivated") : undefined,
  )).orderBy(desc(tenantUsers.joinedAt), asc(users.name)));
}

export async function getMembership(tenantId: string, membershipId: string) {
  return withTenant(tenantId, async (tx) => {
    const [membership] = await tx.select({
      membershipId: tenantUsers.id, userId: users.id, name: users.name, email: users.email,
      phone: users.phone, role: tenantUsers.role, customRoleId: tenantUsers.customRoleId,
      status: tenantUsers.membershipStatus, isActive: tenantUsers.isActive,
      joinedAt: tenantUsers.joinedAt, invitedAt: tenantUsers.invitedAt, lastLoginAt: users.lastLoginAt,
    }).from(tenantUsers).innerJoin(users, eq(tenantUsers.userId, users.id)).where(and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.id, membershipId))).limit(1);
    if (!membership) return null;
    const activity = await tx.select().from(auditLogs).where(and(eq(auditLogs.tenantId, tenantId), eq(auditLogs.actorUserId, membership.userId))).orderBy(desc(auditLogs.createdAt)).limit(10);
    return { ...membership, activity };
  });
}

export async function inviteMembership(tenantId: string, actorUserId: string, actorRole: UserRole, input: { email: string; role: UserRole; name?: string }) {
  assertAssignableRole(actorRole, input.role);
  const email = input.email.trim().toLowerCase();
  return withTenant(tenantId, async (tx) => {
    let user = await tx.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      const passwordHash = await argon2.hash(crypto.randomUUID() + crypto.randomUUID());
      [user] = await tx.insert(users).values({ name: input.name?.trim() || email.split("@")[0], email, passwordHash, isVerified: false, isActive: true }).returning();
    }
    const duplicate = await tx.query.tenantUsers.findFirst({ where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.userId, user.id)) });
    if (duplicate) throw new Error("A membership already exists for this email");
    const pending = !user.isVerified;
    const [membership] = await tx.insert(tenantUsers).values({
      tenantId, userId: user.id, role: input.role,
      membershipStatus: pending ? "invited" : "active",
      invitedAt: pending ? new Date() : null,
      isActive: !pending,
    }).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "membership.invited", entityType: "tenant_user", entityId: membership.id, metadata: { email, role: input.role } });
    return membership;
  });
}

export async function updateMembership(tenantId: string, actorUserId: string, actorRole: UserRole, membershipId: string, input: { role?: UserRole; customRoleId?: string | null; status?: "active" | "invited" | "deactivated" }) {
  if (input.role) assertAssignableRole(actorRole, input.role);
  return withTenant(tenantId, async (tx) => {
    const current = await tx.query.tenantUsers.findFirst({ where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.id, membershipId)) });
    if (!current) throw new Error("Membership not found");
    if (input.customRoleId) {
      const role = await tx.query.customRoles.findFirst({ where: and(eq(customRoles.tenantId, tenantId), eq(customRoles.id, input.customRoleId), eq(customRoles.isActive, true)) });
      if (!role) throw new Error("Custom role not found");
    }
    const status = input.status ?? current.membershipStatus;
    const [updated] = await tx.update(tenantUsers).set({
      role: input.role ?? current.role,
      customRoleId: input.customRoleId === undefined ? current.customRoleId : input.customRoleId,
      membershipStatus: status,
      isActive: status === "active",
      updatedAt: new Date(),
    }).where(and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.id, membershipId))).returning();
    await writeAuditLog(tx, { tenantId, actorUserId, action: "membership.updated", entityType: "tenant_user", entityId: membershipId, metadata: { role: updated.role, status } });
    return updated;
  });
}

export async function listRoles(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const roleCounts = await tx.select({ role: tenantUsers.role, count: count() }).from(tenantUsers).where(eq(tenantUsers.tenantId, tenantId)).groupBy(tenantUsers.role);
    const custom = await tx.select({ id: customRoles.id, name: customRoles.name, description: customRoles.description, baseRole: customRoles.baseRole, isActive: customRoles.isActive, memberCount: count(tenantUsers.id) }).from(customRoles).leftJoin(tenantUsers, and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.customRoleId, customRoles.id))).where(eq(customRoles.tenantId, tenantId)).groupBy(customRoles.id).orderBy(asc(customRoles.name));
    return { builtIn: (Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[]).map((role) => ({ role, permissions: DEFAULT_ROLE_PERMISSIONS[role], memberCount: Number(roleCounts.find((item) => item.role === role)?.count ?? 0) })), custom };
  });
}

function validateGrants(grantorRole: UserRole, grants: Array<{ permission: Permission; effect: "allow" | "deny" }>) {
  const held = new Set(DEFAULT_ROLE_PERMISSIONS[grantorRole]);
  const overreach = grants.filter((grant) => grant.effect === "allow" && !held.has(grant.permission));
  if (overreach.length) throw new Error(`FORBIDDEN: Cannot grant permissions you do not hold: ${overreach.map((grant) => grant.permission).join(", ")}`);
}

export async function createCustomRole(tenantId: string, actorUserId: string, actorRole: UserRole, input: { name: string; description?: string; baseRole: UserRole; grants?: Array<{ permission: Permission; scope?: string | null; effect: "allow" | "deny" }> }) {
  const grants = input.grants ?? [];
  validateGrants(actorRole, grants);
  return withTenant(tenantId, async (tx) => {
    const [role] = await tx.insert(customRoles).values({ tenantId, name: input.name.trim(), description: input.description?.trim() || null, baseRole: input.baseRole, createdBy: actorUserId }).returning();
    if (grants.length) await tx.insert(customRoleGrants).values(grants.map((grant) => ({ tenantId, roleId: role.id, permission: grant.permission, scope: grant.scope ?? null, effect: grant.effect, grantedBy: actorUserId })));
    await writeAuditLog(tx, { tenantId, actorUserId, action: "custom_role.created", entityType: "custom_role", entityId: role.id, metadata: { name: role.name } });
    return role;
  });
}

export async function getCustomRole(tenantId: string, roleId: string) {
  return withTenant(tenantId, async (tx) => {
    const role = await tx.query.customRoles.findFirst({ where: and(eq(customRoles.tenantId, tenantId), eq(customRoles.id, roleId)) });
    if (!role) return null;
    const grants = await tx.select().from(customRoleGrants).where(and(eq(customRoleGrants.tenantId, tenantId), eq(customRoleGrants.roleId, roleId))).orderBy(asc(customRoleGrants.permission));
    return { ...role, grants };
  });
}

export async function updateCustomRole(tenantId: string, actorUserId: string, actorRole: UserRole, roleId: string, input: { name?: string; description?: string | null; baseRole?: UserRole; isActive?: boolean; grants?: Array<{ permission: Permission; scope?: string | null; effect: "allow" | "deny" }> }) {
  if (input.grants) validateGrants(actorRole, input.grants);
  return withTenant(tenantId, async (tx) => {
    const current = await tx.query.customRoles.findFirst({ where: and(eq(customRoles.tenantId, tenantId), eq(customRoles.id, roleId)) });
    if (!current) throw new Error("Custom role not found");
    const [role] = await tx.update(customRoles).set({ name: input.name?.trim() ?? current.name, description: input.description === undefined ? current.description : input.description, baseRole: input.baseRole ?? current.baseRole, isActive: input.isActive ?? current.isActive, updatedAt: new Date() }).where(and(eq(customRoles.tenantId, tenantId), eq(customRoles.id, roleId))).returning();
    if (input.grants) {
      await tx.delete(customRoleGrants).where(and(eq(customRoleGrants.tenantId, tenantId), eq(customRoleGrants.roleId, roleId)));
      if (input.grants.length) await tx.insert(customRoleGrants).values(input.grants.map((grant) => ({ tenantId, roleId, permission: grant.permission, scope: grant.scope ?? null, effect: grant.effect, grantedBy: actorUserId })));
    }
    await writeAuditLog(tx, { tenantId, actorUserId, action: "custom_role.updated", entityType: "custom_role", entityId: roleId, metadata: {} });
    return role;
  });
}

export async function deactivateCustomRole(tenantId: string, roleId: string) {
  return withTenant(tenantId, async (tx) => {
    const [assigned] = await tx.select({ count: count() }).from(tenantUsers).where(and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.customRoleId, roleId), eq(tenantUsers.isActive, true)));
    if (Number(assigned?.count ?? 0) > 0) throw new Error("Cannot deactivate a role with active members");
    const [role] = await tx.update(customRoles).set({ isActive: false, updatedAt: new Date() }).where(and(eq(customRoles.tenantId, tenantId), eq(customRoles.id, roleId))).returning();
    if (!role) throw new Error("Custom role not found");
    return role;
  });
}

export async function listAuditEvents(tenantId: string, limit = 50) {
  return withTenant(tenantId, (tx) => tx.select({ id: auditLogs.id, action: auditLogs.action, entityType: auditLogs.entityType, entityId: auditLogs.entityId, metadata: auditLogs.metadata, ipAddress: auditLogs.ipAddress, createdAt: auditLogs.createdAt, actorName: users.name }).from(auditLogs).leftJoin(users, eq(auditLogs.actorUserId, users.id)).where(eq(auditLogs.tenantId, tenantId)).orderBy(desc(auditLogs.createdAt)).limit(Math.min(limit, 100)));
}

export async function listIntegrations(tenantId: string) {
  return withTenant(tenantId, (tx) => tx.select().from(tenantIntegrations).where(eq(tenantIntegrations.tenantId, tenantId)).orderBy(asc(tenantIntegrations.integrationKey)));
}

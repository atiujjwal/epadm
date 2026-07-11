import argon2 from "argon2";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { tenantUsers, tenants, users } from "@/lib/db";
import type { Permission, PlanTier, UserRole } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { withTenant } from "@/lib/rls";

export type TenantMemberSummary = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  subscriptionTier: PlanTier;
  memberCount: number;
  activeMemberCount: number;
  roleBreakdown: Array<{
    role: UserRole;
    count: number;
  }>;
};

export type TenantMemberRecord = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  joinedAt: Date;
  isVerified: boolean;
};

export type CreateTenantMemberInput = {
  tenantId: string;
  actorUserId: string;
  actorRole: UserRole;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const ADMIN_MEMBER_READ_PERMISSION: Permission = "users.read";
export const ADMIN_MEMBER_WRITE_PERMISSION: Permission = "users.write";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getTenantMemberSummary(
  tenantId: string,
): Promise<TenantMemberSummary | null> {
  return withTenant(tenantId, async (tx) => {
    const [tenant] = await tx
      .select({
        tenantId: tenants.id,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
        subscriptionTier: tenants.subscriptionTier,
      })
      .from(tenants)
      .where(and(eq(tenants.id, tenantId), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      return null;
    }

    const [counts] = await tx
      .select({
        memberCount: count(tenantUsers.id),
        activeMemberCount: sql<number>`count(*) filter (where ${tenantUsers.isActive} = true)`,
      })
      .from(tenantUsers)
      .where(eq(tenantUsers.tenantId, tenantId));

    const roleBreakdownRows = await tx
      .select({
        role: tenantUsers.role,
        count: count(tenantUsers.id),
      })
      .from(tenantUsers)
      .where(and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.isActive, true)))
      .groupBy(tenantUsers.role)
      .orderBy(asc(tenantUsers.role));

    return {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      tenantSlug: tenant.tenantSlug,
      subscriptionTier: tenant.subscriptionTier as PlanTier,
      memberCount: Number(counts?.memberCount ?? 0),
      activeMemberCount: Number(counts?.activeMemberCount ?? 0),
      roleBreakdown: roleBreakdownRows.map((row) => ({
        role: row.role as UserRole,
        count: Number(row.count),
      })),
    };
  });
}

export async function listTenantMembers(
  tenantId: string,
): Promise<TenantMemberRecord[]> {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        membershipId: tenantUsers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: tenantUsers.role,
        isActive: tenantUsers.isActive,
        joinedAt: tenantUsers.joinedAt,
        isVerified: users.isVerified,
      })
      .from(tenantUsers)
      .innerJoin(users, eq(tenantUsers.userId, users.id))
      .where(eq(tenantUsers.tenantId, tenantId))
      .orderBy(desc(tenantUsers.joinedAt), asc(users.name)),
  );

  return rows.map((row) => ({
    membershipId: row.membershipId,
    userId: row.userId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role as UserRole,
    isActive: row.isActive,
    joinedAt: row.joinedAt,
    isVerified: row.isVerified,
  }));
}

export async function createTenantMember(input: CreateTenantMemberInput) {
  const email = normalizeEmail(input.email);
  const passwordHash = await argon2.hash(input.password);

  return withTenant(input.tenantId, async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    const user =
      existingUser ??
      (
        await tx
          .insert(users)
          .values({
            name: input.name.trim(),
            email,
            phone: input.phone?.trim() || null,
            passwordHash,
            isVerified: false,
            isActive: true,
          })
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            isVerified: users.isVerified,
            isActive: users.isActive,
          })
      )[0];

    if (existingUser) {
      const [updatedUser] = await tx
        .update(users)
        .set({
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          isVerified: users.isVerified,
          isActive: users.isActive,
        });

      if (updatedUser) {
        Object.assign(user, updatedUser);
      }
    }

    const existingMembership = await tx.query.tenantUsers.findFirst({
      where: and(
        eq(tenantUsers.tenantId, input.tenantId),
        eq(tenantUsers.userId, user.id),
        eq(tenantUsers.role, input.role),
      ),
    });

    if (existingMembership) {
      throw new Error("A membership with this role already exists for the user.");
    }

    const [membership] = await tx
      .insert(tenantUsers)
      .values({
        tenantId: input.tenantId,
        userId: user.id,
        role: input.role,
        isActive: true,
      })
      .returning({
        id: tenantUsers.id,
        joinedAt: tenantUsers.joinedAt,
      });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "tenant_user.created",
      entityType: "tenant_user",
      entityId: membership.id,
      metadata: {
        createdUserId: user.id,
        createdRole: input.role,
        actorRole: input.actorRole,
        email,
      },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    return {
      membershipId: membership.id,
      joinedAt: membership.joinedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      role: input.role,
    };
  });
}

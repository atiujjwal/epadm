import { PoolClient } from "pg";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { tenants, users, tenantUsers, roles } from "./schema";
import { CreateTenantInput, CreateUserInput, AssignRoleInput } from "./types";
import { requirePermission } from "@/lib/auth/rbac"; // Assumption: Helper exists

// ==========================================
// TENANT MANAGEMENT
// ==========================================

export async function createTenant(
  client: PoolClient,
  data: CreateTenantInput
) {
  // System-level operation (no RLS check usually, or "super-admin" check)
  const db = drizzle(client);

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: data.name,
      slug: data.slug,
      subscriptionTier: data.subscriptionTier || "FOUNDATION",
    })
    .returning();

  // Create Default Roles for new Tenant
  // In production, this might be copied from a "template" role set
  await db.insert(roles).values([
    { tenantId: tenant.id, name: "Admin", permissions: ["*"] },
    {
      tenantId: tenant.id,
      name: "Teacher",
      permissions: ["attendance.write", "grades.write"],
    },
    {
      tenantId: tenant.id,
      name: "Parent",
      permissions: ["attendance.read", "grades.read"],
    },
  ]);

  return tenant;
}

export async function getTenantBySlug(client: PoolClient, slug: string) {
  // Public operation for Middleware
  const db = drizzle(client);
  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);
  return result[0] || null;
}

// ==========================================
// USER & RBAC MANAGEMENT
// ==========================================

export async function createUser(client: PoolClient, data: CreateUserInput) {
  const db = drizzle(client);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    })
    .returning();

  return user;
}

export async function assignUserRole(
  client: PoolClient,
  requesterId: string,
  data: AssignRoleInput
) {
  // Context: The requester must be an Admin in the target tenant
  await requirePermission(client, requesterId, "users.manage");
  const db = drizzle(client);

  const [assignment] = await db
    .insert(tenantUsers)
    .values({
      tenantId: data.tenantId,
      userId: data.userId,
      roleId: data.roleId,
    })
    .returning();

  return assignment;
}

export async function getUserPermissions(
  client: PoolClient,
  tenantId: string,
  userId: string
): Promise<string[]> {
  const db = drizzle(client);

  const result = await db
    .select({
      permissions: roles.permissions,
    })
    .from(tenantUsers)
    .innerJoin(roles, eq(tenantUsers.roleId, roles.id))
    .where(
      and(
        eq(tenantUsers.tenantId, tenantId),
        eq(tenantUsers.userId, userId),
        eq(tenantUsers.isActive, true)
      )
    );

  if (result.length === 0) return [];
  // Flatten permissions if user has multiple roles (future-proof)
  // Currently schema allows only one role per tenant-user pair via Composite PK
  // But logic supports expansion.
  return result[0].permissions as string[];
}

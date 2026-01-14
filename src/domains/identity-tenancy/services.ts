import { PoolClient } from "pg";
import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { tenants, users, tenantUsers, roles } from "./schema";
import { CreateTenantInput, CreateUserInput, AssignRoleInput } from "./types";
import { requirePermission } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/password";


// ==========================================
// TENANT RESOLUTION & BASIC CRUD
// ==========================================

export async function getTenantBySlug(client: PoolClient, slug: string) {
  // Used by Middleware and Login
  const db = drizzle(client);
  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getTenants(client: PoolClient, limit: number = 10, skip: number = 0) {
  // Used by Middleware and Login
  const db = drizzle(client);
  const result = await db
    .select()
    .from(tenants)
    .limit(limit)
    .offset(skip);
  return result || [];
}

export async function createTenant(client: PoolClient, data: CreateTenantInput) {
  const db = drizzle(client);
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: data.name,
      slug: data.slug,
      subscriptionTier: data.subscriptionTier || "FOUNDATION",
    })
    .returning();
  return tenant;
}

// ==========================================
// TENANT BOOTSTRAPPING (SUPER ADMIN)
// ==========================================

export async function bootstrapTenant(
  client: PoolClient,
  data: CreateTenantInput & { adminEmail: string; adminName: string }
) {
  const db = drizzle(client);

  // Create Tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: data.name,
      slug: data.slug,
      subscriptionTier: data.subscriptionTier || "FOUNDATION",
    })
    .returning();

  // Create Standard Roles
  // We return them to capture their IDs
  const createdRoles = await db
    .insert(roles)
    .values([
      { tenantId: tenant.id, name: "Admin", permissions: ["*"] }, // Super Role
      {
        tenantId: tenant.id,
        name: "Principal",
        permissions: [
          "attendance.*",
          "grades.*",
          "users.manage",
          "reports.read",
        ],
      },
      {
        tenantId: tenant.id,
        name: "Teacher",
        permissions: ["attendance.write", "grades.write", "content.read"],
      },
      {
        tenantId: tenant.id,
        name: "Parent",
        permissions: ["attendance.read", "grades.read", "fees.read"],
      },
      {
        tenantId: tenant.id,
        name: "Student",
        permissions: ["content.read", "grades.read"],
      },
    ])
    .returning();

  const adminRole = createdRoles.find((r) => r.name === "Admin");
  if (!adminRole) throw new Error("Failed to create Admin role");

  //  Find or Create Admin User
  // Check if user already exists (e.g. multi-tenant owner)
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.adminEmail));

  if (!user) {
    // Create new user with a temporary password
    const tempPassword = await hashPassword("Welcome@123"); //TODO:  In prod, generate random & email it
    [user] = await db
      .insert(users)
      .values({
        email: data.adminEmail,
        firstName: data.adminName,
        lastName: "Admin",
        passwordHash: tempPassword,
        isVerified: true, // Auto-verify admin
      })
      .returning();
  }

  // Assign Admin Role in this Tenant
  await db.insert(tenantUsers).values({
    tenantId: tenant.id,
    userId: user.id,
    roleId: adminRole.id,
  });

  return { tenant, adminUser: user };
}

// ==========================================
// USER MANAGEMENT (TENANT ADMIN)
// ==========================================

export async function registerUserForTenant(
  client: PoolClient,
  requesterId: string, // The Admin doing the adding
  tenantId: string,
  data: CreateUserInput & { roleName: string }
) {
  // Authorization Check
  await requirePermission(client, requesterId, "users.manage");

  const db = drizzle(client);

  // Resolve Role ID within this Tenant
  const [role] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.tenantId, tenantId), eq(roles.name, data.roleName)));

  if (!role)
    throw new Error(`Role '${data.roleName}' not found in this tenant`);

  // Find or Create Global User
  let [user] = await db.select().from(users).where(eq(users.email, data.email));

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .returning();
  }

  // Check if already a member
  const [existingMember] = await db
    .select()
    .from(tenantUsers)
    .where(
      and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.userId, user.id))
    );

  if (existingMember)
    throw new Error("User is already a member of this tenant");

  // Assign Role
  await db.insert(tenantUsers).values({
    tenantId,
    userId: user.id,
    roleId: role.id,
  });

  return user;
}

export async function getUserByEmail(client: PoolClient, email: string) {
  const db = drizzle(client);
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

export async function getTenantMembership(
  client: PoolClient,
  userId: string,
  tenantId: string
) {
  const db = drizzle(client);

  const [membership] = await db
    .select({
      roleName: roles.name,
      permissions: roles.permissions,
    })
    .from(tenantUsers)
    .innerJoin(roles, eq(tenantUsers.roleId, roles.id))
    .where(
      and(
        eq(tenantUsers.userId, userId),
        eq(tenantUsers.tenantId, tenantId),
        eq(tenantUsers.isActive, true)
      )
    );

  return membership || null;
}

export async function getUserPermissions(
  client: PoolClient,
  tenantId: string,
  userId: string
): Promise<string[]> {
  const db = drizzle(client);
  const result = await db
    .select({ permissions: roles.permissions })
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
  return result[0].permissions as string[];
}

// ==========================================
// READ OPERATIONS (ADMIN DASHBOARD)
// ==========================================

export async function getTenantRoles(client: PoolClient, tenantId: string) {
  const db = drizzle(client);
  
  return await db
    .select()
    .from(roles)
    .where(eq(roles.tenantId, tenantId))
    .orderBy(roles.name);
}

export async function getTenantUsers(client: PoolClient, tenantId: string) {
  const db = drizzle(client);
  
  // Join Users + TenantUsers + Roles to get a complete view
  return await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: roles.name,
      joinedAt: tenantUsers.joinedAt,
      isActive: tenantUsers.isActive,
    })
    .from(tenantUsers)
    .innerJoin(users, eq(tenantUsers.userId, users.id))
    .innerJoin(roles, eq(tenantUsers.roleId, roles.id))
    .where(eq(tenantUsers.tenantId, tenantId))
    .orderBy(desc(tenantUsers.joinedAt));
}
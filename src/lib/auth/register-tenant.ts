import "server-only";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import {
  opsDb,
  SERVICE_KEYS,
  tenantServices,
  tenants,
  tenantUsers,
  users,
  type PlanTier,
} from "@/lib/db/ops";
import { writeAuditLog } from "@/lib/audit";
import { setTenantActiveCache } from "@/lib/platform/tenant-cache";

const TENANT_DOMAIN_SUFFIX =
  process.env.TENANT_DOMAIN_SUFFIX ?? "schoolapp.com";

export type SelfServeRegisterInput = {
  name: string;
  slug: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  subscriptionTier?: PlanTier;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function registerTenant(input: SelfServeRegisterInput) {
  const slug = input.slug.toLowerCase();
  const adminEmail = input.adminEmail.toLowerCase();

  const existingTenant = await opsDb.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });

  if (existingTenant) {
    throw new Error("School identifier is already taken");
  }

  const existingUser = await opsDb.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await argon2.hash(input.adminPassword);
  const subscriptionTier = input.subscriptionTier ?? "basic";

  const [tenant] = await opsDb
    .insert(tenants)
    .values({
      name: input.name,
      slug,
      email: adminEmail,
      subscriptionTier,
      isActive: true,
    })
    .returning();

  const [user] = await opsDb
    .insert(users)
    .values({
      name: input.adminName,
      email: adminEmail,
      passwordHash,
      isVerified: false,
      isActive: true,
    })
    .returning();

  await opsDb.insert(tenantUsers).values({
    tenantId: tenant.id,
    userId: user.id,
    role: "admin",
    isActive: true,
  });

  for (const serviceKey of SERVICE_KEYS) {
    await opsDb.insert(tenantServices).values({
      tenantId: tenant.id,
      serviceKey,
      isEnabled: true,
    });
  }

  await setTenantActiveCache(tenant.id, true);

  await writeAuditLog(opsDb, {
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "tenant.self_registered",
    entityType: "tenant",
    entityId: tenant.id,
    metadata: {
      slug,
      adminEmail,
      subscriptionTier,
    },
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });

  return {
    tenantId: tenant.id,
    slug,
    adminUserId: user.id,
    domain: `${slug}.${TENANT_DOMAIN_SUFFIX}`,
  };
}

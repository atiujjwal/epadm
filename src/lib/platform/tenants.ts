import "server-only";
import argon2 from "argon2";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  opsDb,
  tenantDailyMetrics,
  tenantServices,
  tenantSubscriptions,
  tenants,
  users,
  tenantUsers,
  SERVICE_KEYS,
  type PlanTier,
  type ServiceKey,
} from "@/lib/db/ops";
import { writePlatformAuditLog } from "@/lib/platform/audit";
import {
  setTenantActiveCache,
  getActiveModulesCached,
  setActiveModulesCache,
  invalidateTenantModulesCache,
} from "@/lib/platform/tenant-cache";

const TENANT_DOMAIN_SUFFIX =
  process.env.TENANT_DOMAIN_SUFFIX ?? "schoolapp.com";

export type ProvisionTenantInput = {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword?: string;
  subscriptionTier: PlanTier;
  operatorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function provisionTenant(input: ProvisionTenantInput) {
  const slug = input.slug.toLowerCase();

  const existing = await opsDb.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });

  if (existing) {
    throw new Error("Tenant slug already exists");
  }

  const [tenant] = await opsDb
    .insert(tenants)
    .values({
      name: input.name,
      slug,
      subscriptionTier: input.subscriptionTier,
      isActive: true,
    })
    .returning();

  const adminEmail = input.adminEmail.toLowerCase();
  let user = await opsDb.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!user) {
    const rawPassword = input.adminPassword || crypto.randomUUID();
    const passwordHash = await argon2.hash(rawPassword);
    [user] = await opsDb
      .insert(users)
      .values({
        name: `${input.name} Administrator`,
        email: adminEmail,
        passwordHash,
        isVerified: false,
        isActive: true,
      })
      .returning();
  } else if (input.adminPassword) {
    // Operator explicitly set a password — update the existing user's credentials
    const passwordHash = await argon2.hash(input.adminPassword);
    await opsDb
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id));
  }

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

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const defaultModules = ["Base ERP", "AI Suite", "Transport GPS", "Biometrics"];
  for (const moduleName of defaultModules) {
    await opsDb.insert(tenantSubscriptions).values({
      tenantId: tenant.id,
      moduleName,
      status: "active",
      billingCycleStart: now,
      billingCycleEnd: nextYear,
    });
  }

  await setTenantActiveCache(tenant.id, true);
  await invalidateTenantModulesCache(tenant.id);

  await writePlatformAuditLog({
    operatorId: input.operatorId,
    action: "tenant.provisioned",
    entityType: "tenant",
    entityId: tenant.id,
    metadata: {
      slug,
      adminEmail,
      subscriptionTier: input.subscriptionTier,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    tenantId: tenant.id,
    domain: `${slug}.${TENANT_DOMAIN_SUFFIX}`,
  };
}

export async function listTenants(options?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 25;
  const offset = (page - 1) * pageSize;
  const search = options?.search?.trim();

  const whereClause = search
    ? or(
        ilike(tenants.name, `%${search}%`),
        ilike(tenants.slug, `%${search}%`),
      )
    : undefined;

  const rows = await opsDb
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      isActive: tenants.isActive,
      subscriptionTier: tenants.subscriptionTier,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .where(whereClause)
    .orderBy(desc(tenants.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [countRow] = await opsDb
    .select({ count: sql<number>`count(*)::int` })
    .from(tenants)
    .where(whereClause);

  return {
    tenants: rows,
    total: countRow?.count ?? 0,
    page,
    pageSize,
  };
}

export async function getTenantDetail(tenantId: string) {
  const [tenant] = await opsDb
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) {
    return null;
  }

  const services = await opsDb
    .select()
    .from(tenantServices)
    .where(eq(tenantServices.tenantId, tenantId));

  const metrics = await opsDb
    .select()
    .from(tenantDailyMetrics)
    .where(eq(tenantDailyMetrics.tenantId, tenantId))
    .orderBy(desc(tenantDailyMetrics.logDate))
    .limit(30);

  return { tenant, services, metrics };
}

export async function setTenantStatus(input: {
  tenantId: string;
  isActive: boolean;
  reason?: string;
  operatorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const [tenant] = await opsDb
    .update(tenants)
    .set({ isActive: input.isActive })
    .where(eq(tenants.id, input.tenantId))
    .returning();

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await setTenantActiveCache(tenant.id, input.isActive);

  await writePlatformAuditLog({
    operatorId: input.operatorId,
    action: input.isActive ? "tenant.activated" : "tenant.deactivated",
    entityType: "tenant",
    entityId: tenant.id,
    metadata: { reason: input.reason ?? null, slug: tenant.slug },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return tenant;
}

export async function setTenantService(input: {
  tenantId: string;
  serviceKey: ServiceKey;
  isEnabled: boolean;
  operatorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const [row] = await opsDb
    .insert(tenantServices)
    .values({
      tenantId: input.tenantId,
      serviceKey: input.serviceKey,
      isEnabled: input.isEnabled,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [tenantServices.tenantId, tenantServices.serviceKey],
      set: {
        isEnabled: input.isEnabled,
        updatedAt: new Date(),
      },
    })
    .returning();

  await writePlatformAuditLog({
    operatorId: input.operatorId,
    action: "tenant.service_toggled",
    entityType: "tenant_service",
    entityId: row.id,
    metadata: {
      tenantId: input.tenantId,
      serviceKey: input.serviceKey,
      isEnabled: input.isEnabled,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return row;
}

export async function getPlatformOverview() {
  const [tenantStats] = await opsDb
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${tenants.isActive})::int`,
    })
    .from(tenants);

  const [metricStats] = await opsDb
    .select({
      totalTokens: sql<number>`coalesce(sum(${tenantDailyMetrics.totalAiTokens}), 0)::int`,
      totalCost: sql<string>`coalesce(sum(${tenantDailyMetrics.computeCostInr}), 0)`,
    })
    .from(tenantDailyMetrics)
    .where(
      sql`${tenantDailyMetrics.logDate} >= current_date - interval '30 days'`,
    );

  const recentMetrics = await opsDb
    .select({
      logDate: tenantDailyMetrics.logDate,
      totalTokens: sql<number>`sum(${tenantDailyMetrics.totalAiTokens})::int`,
      totalCost: sql<string>`sum(${tenantDailyMetrics.computeCostInr})`,
    })
    .from(tenantDailyMetrics)
    .where(
      sql`${tenantDailyMetrics.logDate} >= current_date - interval '14 days'`,
    )
    .groupBy(tenantDailyMetrics.logDate)
    .orderBy(tenantDailyMetrics.logDate);

  return {
    tenantStats,
    metricStats,
    recentMetrics,
  };
}

export async function isTenantServiceEnabled(
  tenantId: string,
  serviceKey: ServiceKey,
): Promise<boolean> {
  const [row] = await opsDb
    .select({ isEnabled: tenantServices.isEnabled })
    .from(tenantServices)
    .where(
      and(
        eq(tenantServices.tenantId, tenantId),
        eq(tenantServices.serviceKey, serviceKey),
      ),
    )
    .limit(1);

  return row?.isEnabled ?? true;
}

export async function getActiveModulesForTenant(
  tenantId: string,
): Promise<string[]> {
  const now = new Date();
  const rows = await opsDb
    .select({ moduleName: tenantSubscriptions.moduleName })
    .from(tenantSubscriptions)
    .where(
      and(
        eq(tenantSubscriptions.tenantId, tenantId),
        eq(tenantSubscriptions.status, "active"),
        sql`${tenantSubscriptions.billingCycleStart} <= ${now}`,
        sql`${tenantSubscriptions.billingCycleEnd} >= ${now}`,
      ),
    );
  return rows.map((r) => r.moduleName);
}

export async function getActiveModulesForTenantCached(
  tenantId: string,
): Promise<string[]> {
  const cached = await getActiveModulesCached(tenantId);
  if (cached !== null) {
    return cached;
  }

  const modules = await getActiveModulesForTenant(tenantId);
  await setActiveModulesCache(tenantId, modules);
  return modules;
}

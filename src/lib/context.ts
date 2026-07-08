import { cache } from "react";
import { headers } from "next/headers";
import type { PlanTier, UserRole } from "./db";
import { db, tenants } from "./db";
import { eq } from "drizzle-orm";
import {
  isTenantActiveCached,
  setTenantActiveCache,
  getActiveModulesCached,
  setActiveModulesCache,
} from "@/lib/platform/tenant-cache";
import { getActiveModulesForTenant } from "@/lib/platform/tenants";

export type ServiceCtx = {
  tenantId: string;
  userId: string;
  role: UserRole;
  planTier: PlanTier;
  activeModules: string[];
};

/**
 * Builds the per-request service context from middleware-injected headers.
 * Performs database and cache checks for tenant status and active modules.
 */
async function _getCtx(): Promise<ServiceCtx> {
  const h = await headers();

  const tenantId = h.get("x-tenant-id") ?? "";
  const userId = h.get("x-user-id") ?? "";
  const role = (h.get("x-user-role") ?? "admin") as UserRole;
  const planTierFromHeader = h.get("x-plan-tier") as PlanTier | null;

  if (!tenantId || !userId) {
    throw new Error("Missing tenant or user context in headers");
  }

  // 1. Verify if tenant is active
  const cachedActive = await isTenantActiveCached(tenantId);
  if (cachedActive === false) {
    throw new Error("School account is deactivated");
  }

  let planTier: PlanTier = planTierFromHeader ?? "basic";

  if (cachedActive === null) {
    const [tenant] = await db
      .select({ isActive: tenants.isActive, subscriptionTier: tenants.subscriptionTier })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant || !tenant.isActive) {
      if (tenant) {
        await setTenantActiveCache(tenantId, false);
      }
      throw new Error("School account is deactivated");
    }

    await setTenantActiveCache(tenantId, true);
    if (!planTierFromHeader && tenant.subscriptionTier) {
      planTier = tenant.subscriptionTier as PlanTier;
    }
  } else if (!planTierFromHeader) {
    const [tenant] = await db
      .select({ subscriptionTier: tenants.subscriptionTier })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenant?.subscriptionTier) {
      planTier = tenant.subscriptionTier as PlanTier;
    }
  }

  // 2. Resolve active modules
  let activeModules: string[] = [];
  const cachedModules = await getActiveModulesCached(tenantId);
  if (cachedModules !== null) {
    activeModules = cachedModules;
  } else {
    activeModules = await getActiveModulesForTenant(tenantId);
    await setActiveModulesCache(tenantId, activeModules);
  }

  return {
    tenantId,
    userId,
    role,
    planTier,
    activeModules,
  };
}

export const getCtx = cache(_getCtx);

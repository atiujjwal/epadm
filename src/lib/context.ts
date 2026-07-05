import { cache } from "react";
import { headers } from "next/headers";
import type { PlanTier, UserRole } from "./db";
import { db, tenants } from "./db";
import { eq } from "drizzle-orm";

export type ServiceCtx = {
  tenantId: string;
  userId: string;
  role: UserRole;
  planTier: PlanTier;
  activeModules: string[];
};

/**
 * Builds the per-request service context from middleware-injected headers.
 *
 * middleware.ts currently sets:
 *   x-tenant-id
 *   x-user-id
 *   x-user-role
 *
 * In the next step we can extend this to also look up the tenant's subscription
 * tier from the database and cache it.
 */
async function _getCtx(): Promise<ServiceCtx> {
  const h = await headers();

  const tenantId = h.get("x-tenant-id") ?? "";
  const userId = h.get("x-user-id") ?? "";
  const role = (h.get("x-user-role") ?? "admin") as UserRole;
  const planTierFromHeader = h.get("x-plan-tier") as PlanTier | null;
  const activeModulesHeader = h.get("x-active-modules") ?? "";
  const activeModules = activeModulesHeader.split(",").filter(Boolean);

  if (!tenantId || !userId) {
    throw new Error("Missing tenant or user context in headers");
  }

  let planTier: PlanTier = planTierFromHeader ?? "basic";

  if (!planTierFromHeader) {
    const [tenant] = await db
      .select({ subscriptionTier: tenants.subscriptionTier })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenant?.subscriptionTier) {
      planTier = tenant.subscriptionTier as PlanTier;
    }
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

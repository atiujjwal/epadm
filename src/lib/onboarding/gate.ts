import { eq } from "drizzle-orm";
import { tenants, type OnboardingStatus, type UserRole } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export async function getOnboardingStatusForGate(tenantId: string): Promise<OnboardingStatus> {
  const [tenant] = await withTenant(tenantId, (tx) =>
    tx
      .select({ onboardingStatus: tenants.onboardingStatus })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1),
  );

  return (tenant?.onboardingStatus ?? "PENDING") as OnboardingStatus;
}

export function canManageOnboarding(role: string | UserRole) {
  return role === "superadmin" || role === "admin";
}

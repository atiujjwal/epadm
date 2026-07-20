import { and, asc, eq } from "drizzle-orm";
import { mobileFeatureFlags } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const MOBILE_READ_PERMISSION = "tenant.manage" as const;
export const MOBILE_WRITE_PERMISSION = "tenant.manage" as const;

export type MobileFlagRecord = {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  createdAt: Date;
};

export type UpsertMobileFlagInput = {
  tenantId: string;
  key: string;
  label: string;
  enabled?: boolean;
};

export async function listMobileFlags(tenantId: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: mobileFeatureFlags.id,
        key: mobileFeatureFlags.key,
        label: mobileFeatureFlags.label,
        enabled: mobileFeatureFlags.enabled,
        createdAt: mobileFeatureFlags.createdAt,
      })
      .from(mobileFeatureFlags)
      .where(eq(mobileFeatureFlags.tenantId, tenantId))
      .orderBy(asc(mobileFeatureFlags.label)),
  );

  return rows satisfies MobileFlagRecord[];
}

export async function upsertMobileFlag(input: UpsertMobileFlagInput) {
  const key = input.key.trim().toLowerCase().replace(/\s+/g, "_");

  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.query.mobileFeatureFlags.findFirst({
      where: and(
        eq(mobileFeatureFlags.tenantId, input.tenantId),
        eq(mobileFeatureFlags.key, key),
      ),
    });

    if (existing) {
      const [updated] = await tx
        .update(mobileFeatureFlags)
        .set({
          label: input.label.trim(),
          enabled: input.enabled ?? existing.enabled,
          updatedAt: new Date(),
        })
        .where(eq(mobileFeatureFlags.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await tx
      .insert(mobileFeatureFlags)
      .values({
        tenantId: input.tenantId,
        key,
        label: input.label.trim(),
        enabled: input.enabled ?? false,
      })
      .returning();

    return created;
  });
}

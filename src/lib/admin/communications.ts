import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { messageCampaigns } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export const CAMPAIGN_READ_PERMISSION = "announcements.read" as const;
export const CAMPAIGN_WRITE_PERMISSION = "announcements.write" as const;

export type CampaignRecord = {
  id: string;
  name: string;
  channel: string;
  audience: string;
  status: string;
  sentCount: number;
  deliveredCount: number;
  createdAt: Date;
};

export type CreateCampaignInput = {
  tenantId: string;
  name: string;
  channel: string;
  audience: string;
  status?: string;
};

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

export async function listCampaigns(tenantId: string, search?: string) {
  const rows = await withTenant(tenantId, (tx) =>
    tx
      .select({
        id: messageCampaigns.id,
        name: messageCampaigns.name,
        channel: messageCampaigns.channel,
        audience: messageCampaigns.audience,
        status: messageCampaigns.status,
        sentCount: messageCampaigns.sentCount,
        deliveredCount: messageCampaigns.deliveredCount,
        createdAt: messageCampaigns.createdAt,
      })
      .from(messageCampaigns)
      .where(
        search
          ? and(
              eq(messageCampaigns.tenantId, tenantId),
              or(
                ilike(messageCampaigns.name, `%${search}%`),
                ilike(messageCampaigns.channel, `%${search}%`),
                ilike(messageCampaigns.audience, `%${search}%`),
              ),
            )
          : eq(messageCampaigns.tenantId, tenantId),
      )
      .orderBy(desc(messageCampaigns.createdAt), asc(messageCampaigns.name)),
  );

  return rows satisfies CampaignRecord[];
}

export async function createCampaign(input: CreateCampaignInput) {
  return withTenant(input.tenantId, async (tx) => {
    const [campaign] = await tx
      .insert(messageCampaigns)
      .values({
        tenantId: input.tenantId,
        name: input.name.trim(),
        channel: input.channel.trim(),
        audience: input.audience.trim(),
        status: clean(input.status) ?? "draft",
      })
      .returning();

    return campaign;
  });
}

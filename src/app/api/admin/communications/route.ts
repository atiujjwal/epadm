import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  CAMPAIGN_READ_PERMISSION,
  CAMPAIGN_WRITE_PERMISSION,
  createCampaign,
  listCampaigns,
} from "@/lib/admin/communications";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const campaignSchema = z.object({
  name: z.string().trim().min(2).max(255),
  channel: z.string().trim().min(1).max(40),
  audience: z.string().trim().min(1).max(120),
  status: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function GET(req: Request) {
  try {
    const ctx = await requirePermission(CAMPAIGN_READ_PERMISSION);
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const campaigns = await listCampaigns(ctx.tenantId, search);
    return ok({ campaigns });
  } catch (error) {
    console.error("[admin/communications][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(CAMPAIGN_WRITE_PERMISSION);
    const input = campaignSchema.parse(await req.json());

    const campaign = await createCampaign({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[admin/communications][POST] Unexpected error:", error);
    return serverError();
  }
}

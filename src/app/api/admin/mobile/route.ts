import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  listMobileFlags,
  MOBILE_READ_PERMISSION,
  MOBILE_WRITE_PERMISSION,
  upsertMobileFlag,
} from "@/lib/admin/mobile";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const flagSchema = z.object({
  key: z.string().trim().min(2).max(80),
  label: z.string().trim().min(2).max(255),
  enabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const ctx = await requirePermission(MOBILE_READ_PERMISSION);
    const flags = await listMobileFlags(ctx.tenantId);
    return ok({ flags });
  } catch (error) {
    console.error("[admin/mobile][GET] Unexpected error:", error);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePermission(MOBILE_WRITE_PERMISSION);
    const input = flagSchema.parse(await req.json());

    const flag = await upsertMobileFlag({
      tenantId: ctx.tenantId,
      ...input,
    });

    return ok({ success: true, flag }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[admin/mobile][POST] Unexpected error:", error);
    return serverError();
  }
}

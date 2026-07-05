import { headers } from "next/headers";
import { z } from "zod";
import { requirePlatformOperator } from "@/lib/platform/context";
import { setTenantStatus } from "@/lib/platform/tenants";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const statusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const ctx = await requirePlatformOperator();
    const requestHeaders = await headers();
    const { id } = await params;
    const body = statusSchema.parse(await req.json());

    const tenant = await setTenantStatus({
      tenantId: id,
      isActive: body.isActive,
      reason: body.reason,
      operatorId: ctx.operatorId,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, tenant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    if (error instanceof Error && error.message === "Tenant not found") {
      return badRequest(error.message);
    }

    console.error("[platform/tenants/[id]/status][PATCH]", error);
    return serverError();
  }
}

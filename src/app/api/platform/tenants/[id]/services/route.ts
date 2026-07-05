import { headers } from "next/headers";
import { z } from "zod";
import { SERVICE_KEYS } from "@/lib/db/schema";
import { requirePlatformOperator } from "@/lib/platform/context";
import { setTenantService } from "@/lib/platform/tenants";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const serviceSchema = z.object({
  serviceKey: z.enum(SERVICE_KEYS),
  isEnabled: z.boolean(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requirePlatformOperator();
    const requestHeaders = await headers();
    const { id } = await params;
    const body = serviceSchema.parse(await req.json());

    const service = await setTenantService({
      tenantId: id,
      serviceKey: body.serviceKey,
      isEnabled: body.isEnabled,
      operatorId: ctx.operatorId,
      ipAddress:
        requestHeaders.get("x-forwarded-for") ??
        requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent"),
    });

    return ok({ success: true, service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("Invalid payload", error.flatten());
    }

    console.error("[platform/tenants/[id]/services][PUT]", error);
    return serverError();
  }
}

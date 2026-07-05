import { requirePlatformOperator } from "@/lib/platform/context";
import { getTenantDetail } from "@/lib/platform/tenants";
import { notFound, ok, serverError } from "@/lib/http/responses";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requirePlatformOperator();
    const { id } = await params;
    const detail = await getTenantDetail(id);

    if (!detail) {
      return notFound("Tenant not found");
    }

    return ok(detail);
  } catch (error) {
    console.error("[platform/tenants/[id]][GET]", error);
    return serverError();
  }
}

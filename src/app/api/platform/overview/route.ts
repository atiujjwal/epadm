import { requirePlatformOperator } from "@/lib/platform/context";
import { getPlatformOverview } from "@/lib/platform/tenants";
import { ok, serverError } from "@/lib/http/responses";

export async function GET() {
  try {
    await requirePlatformOperator();
    const overview = await getPlatformOverview();
    return ok(overview);
  } catch (error) {
    console.error("[platform/overview][GET]", error);
    return serverError();
  }
}

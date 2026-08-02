import { withApiObservability } from "@/lib/observability/api-handler";
import { requireRole } from "@/lib/auth/guards";
import { getTenantOnboarding } from "@/lib/onboarding/service";
import { ok, serverError } from "@/lib/http/responses";

async function GETHandler() {
  try {
    const ctx = await requireRole(["superadmin", "admin"]);
    const onboarding = await getTenantOnboarding(ctx.tenantId);
    return ok(onboarding);
  } catch (error) {
    console.error("[onboarding/defaults][GET] Unexpected error:", error);
    return serverError();
  }
}

export const GET = withApiObservability(GETHandler);

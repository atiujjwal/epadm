import { withApiObservability } from "@/lib/observability/api-handler";
import { requireRole } from "@/lib/auth/guards";
import { completeOnboarding } from "@/lib/onboarding/service";
import { badRequest, ok, serverError } from "@/lib/http/responses";

async function POSTHandler() {
  try {
    const ctx = await requireRole(["superadmin", "admin"]);
    const result = await completeOnboarding({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      role: ctx.role,
    });
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[onboarding/complete][POST] Unexpected error:", error);
    return serverError();
  }
}

export const POST = withApiObservability(POSTHandler);

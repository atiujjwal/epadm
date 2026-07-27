import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { saveOnboardingStep, type OnboardingStep } from "@/lib/onboarding/service";
import { badRequest, ok, serverError } from "@/lib/http/responses";

const syncSchema = z.object({
  step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  data: z.unknown(),
  exit: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const ctx = await requireRole(["superadmin", "admin"]);
    const input = syncSchema.parse(await req.json());
    const result = await saveOnboardingStep({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      role: ctx.role,
      step: input.step as OnboardingStep,
      data: input.data,
      exit: input.exit,
    });
    return ok(result);
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest("Invalid onboarding payload", error.flatten());
    if (error instanceof Error && error.message) return badRequest(error.message);
    console.error("[onboarding/sync][POST] Unexpected error:", error);
    return serverError();
  }
}

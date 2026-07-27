import { redirect } from "next/navigation";
import { getCtx } from "@/lib/context";
import { getTenantOnboarding, isSuperadminRole } from "@/lib/onboarding/service";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const ctx = await getCtx();
  if (!isSuperadminRole(ctx.role)) redirect("/setup-pending");

  const onboarding = await getTenantOnboarding(ctx.tenantId);
  if (onboarding.status === "COMPLETED") redirect("/");

  return <OnboardingWizard initialDraft={onboarding.draft} initialStep={onboarding.step} />;
}

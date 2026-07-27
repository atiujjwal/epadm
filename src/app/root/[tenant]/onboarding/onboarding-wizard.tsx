"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormError, FormSuccess } from "@/components/ui/form";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import type { OnboardingDraft } from "@/lib/onboarding/defaults";
import { OnboardingProvider, useOnboarding } from "./onboarding-provider";
import { WizardLayout } from "./wizard-layout";
import { StepOneProfile } from "./step-one-profile";
import { StepTwoAcademics } from "./step-two-academics";
import { StepThreeStaff } from "./step-three-staff";
import { StepFourOperations } from "./step-four-operations";

export function OnboardingWizard({ initialDraft, initialStep }: { initialDraft: OnboardingDraft; initialStep: number }) {
  return (
    <OnboardingProvider initialDraft={initialDraft} initialStep={initialStep}>
      <Wizard />
    </OnboardingProvider>
  );
}

function Wizard() {
  const router = useRouter();
  const { draft, step, setStep } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function save(options?: { exit?: boolean; skip?: boolean }) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetchWithCsrf("/api/onboarding/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data: dataForStep(draft, step), exit: options?.exit }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "Could not save onboarding.");

      if (options?.exit) {
        await fetchWithCsrf("/api/auth/logout", { method: "POST" });
        window.location.assign("/");
        return;
      }

      if (step === 4 || options?.skip && step === 4) {
        await complete();
        return;
      }

      setStep(Math.min(step + 1, 4));
      setMessage({ type: "success", text: "Progress saved." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not save onboarding." });
    } finally {
      setSaving(false);
    }
  }

  async function complete() {
    const response = await fetchWithCsrf("/api/onboarding/complete", { method: "POST" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error ?? "Could not complete onboarding.");
    router.push("/");
    router.refresh();
  }

  const body = step === 1 ? <StepOneProfile /> : step === 2 ? <StepTwoAcademics /> : step === 3 ? <StepThreeStaff /> : <StepFourOperations />;

  return (
    <WizardLayout
      step={step}
      saving={saving}
      canSkip={step >= 3}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      onContinue={() => save()}
      onSkip={() => save({ skip: true })}
      onExit={() => save({ exit: true })}
      continueLabel={step === 4 ? "Complete Onboarding" : "Save & Continue"}
    >
      <div className="space-y-4">
        {message?.type === "error" ? <FormError>{message.text}</FormError> : null}
        {message?.type === "success" ? <FormSuccess>{message.text}</FormSuccess> : null}
        {body}
      </div>
    </WizardLayout>
  );
}

function dataForStep(draft: OnboardingDraft, step: number) {
  if (step === 1) return draft.profile;
  if (step === 2) return draft.academics;
  if (step === 3) return draft.organization;
  return draft.operations;
}

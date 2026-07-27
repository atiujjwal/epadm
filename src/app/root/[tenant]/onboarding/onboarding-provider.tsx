"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { OnboardingDraft } from "@/lib/onboarding/defaults";

type OnboardingContextValue = {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
  step: number;
  setStep: (step: number) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
  initialDraft,
  initialStep,
}: {
  children: ReactNode;
  initialDraft: OnboardingDraft;
  initialStep: number;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 1), 4));
  const value = useMemo(() => ({ draft, setDraft, step, setStep }), [draft, step]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return context;
}

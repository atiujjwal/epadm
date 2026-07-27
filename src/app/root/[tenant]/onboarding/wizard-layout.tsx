"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const labels = ["Institution Profile", "Academic Infrastructure", "Staff & Departments", "Operational Setup"];

export function WizardLayout({
  step,
  saving,
  children,
  canSkip,
  onBack,
  onContinue,
  onSkip,
  onExit,
  continueLabel = "Save & Continue",
}: {
  step: number;
  saving: boolean;
  children: React.ReactNode;
  canSkip?: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  onExit: () => void;
  continueLabel?: string;
}) {
  const progress = Math.round((step / labels.length) * 100);
  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Tenant onboarding</div>
          <h1 className="mt-1 text-2xl font-semibold">{labels[step - 1]}</h1>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{progress}% complete</div>
        </div>

        <Card padding="lg" className="rounded-lg">
          {children}
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={onExit} disabled={saving}>Save & Exit</Button>
          <div className="flex gap-2">
            {onBack ? <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>Back</Button> : null}
            {canSkip && onSkip ? <Button type="button" variant="secondary" onClick={onSkip} disabled={saving}>Skip for Now</Button> : null}
            <Button type="button" onClick={onContinue} disabled={saving}>{saving ? "Saving..." : continueLabel}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

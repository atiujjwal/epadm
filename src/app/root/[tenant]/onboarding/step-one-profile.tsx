"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "./onboarding-provider";

export function StepOneProfile() {
  const { draft, setDraft } = useOnboarding();
  const profile = draft.profile;
  const setField = (key: keyof typeof profile, value: string) =>
    setDraft({ ...draft, profile: { ...profile, [key]: value } });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-primary">Institution Profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">These details become the foundation of the tenant profile.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Field id="schoolName" label="School Name" required>
          <Input id="schoolName" value={profile.schoolName} onChange={(event) => setField("schoolName", event.target.value)} required />
        </Field>
        <Field id="shortName" label="Short Form" required>
          <Input id="shortName" value={profile.shortName} onChange={(event) => setField("shortName", event.target.value)} placeholder="DPS" required />
        </Field>
        <Field id="logoUrl" label="Logo URL">
          <Input id="logoUrl" value={profile.logoUrl} onChange={(event) => setField("logoUrl", event.target.value)} placeholder="https://..." />
        </Field>
        <Field id="foundationYear" label="Foundation Year">
          <Input id="foundationYear" value={profile.foundationYear} onChange={(event) => setField("foundationYear", event.target.value)} placeholder="1998" />
        </Field>
        <Field id="academicYear" label="Active Academic Year" required>
          <Input id="academicYear" value={profile.academicYear} onChange={(event) => setField("academicYear", event.target.value)} placeholder="2026-27" required />
        </Field>
        <Field id="academicYearStart" label="Academic Year Start" required>
          <Input id="academicYearStart" type="date" value={profile.academicYearStart} onChange={(event) => setField("academicYearStart", event.target.value)} required />
        </Field>
      </div>
    </div>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{required ? " *" : ""}</Label>
      {children}
    </div>
  );
}

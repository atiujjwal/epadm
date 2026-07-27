"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "./onboarding-provider";
import { ObjectListEditor } from "./list-editors";

export function StepFourOperations() {
  const { draft, setDraft } = useOnboarding();
  const operations = draft.operations;
  const update = (next: typeof operations) => setDraft({ ...draft, operations: next });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-primary">Operational Setup</h2>
        <p className="mt-1 text-xs text-muted-foreground">Optional defaults for library, payroll, and house systems.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-3 rounded-md border p-3 lg:grid-cols-2">
          <Field id="accessionPrefix" label="Library accession prefix">
            <Input id="accessionPrefix" value={operations.library.accessionPrefix} onChange={(event) => update({ ...operations, library: { ...operations.library, accessionPrefix: event.target.value } })} />
          </Field>
          <Field id="lendingDays" label="Lending days">
            <Input id="lendingDays" type="number" min={1} value={operations.library.lendingDays} onChange={(event) => update({ ...operations, library: { ...operations.library, lendingDays: Number(event.target.value) } })} />
          </Field>
          <Field id="payrollCycle" label="Payroll cycle">
            <Input id="payrollCycle" value={operations.payroll.cycle} onChange={(event) => update({ ...operations, payroll: { ...operations.payroll, cycle: event.target.value } })} />
          </Field>
          <Field id="payoutDay" label="Payout day">
            <Input id="payoutDay" type="number" min={1} max={31} value={operations.payroll.payoutDay} onChange={(event) => update({ ...operations, payroll: { ...operations.payroll, payoutDay: Number(event.target.value) } })} />
          </Field>
        </div>
        <ObjectListEditor
          title="Houses"
          values={operations.houses}
          empty={{ name: "", color: "" }}
          fields={[{ key: "name", label: "House", placeholder: "Red" }, { key: "color", label: "Color", placeholder: "Red" }]}
          onChange={(houses) => update({ ...operations, houses })}
        />
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
